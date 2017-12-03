import express from 'express';
import Router from 'express-promise-router';
import multer from 'multer';
import _ from 'lodash';
import * as Mapper from 'jsonapi-mapper';
import Joi from 'joi';
import escape from 'escape-html';
import fs from 'fs-extra';
import path from 'path';
import httpErrors from 'http-errors';

import showoffConfig from '../../../config/showoff';
import models from '../../../models';
import frameViews from '../../../frameViews';


const { uploadDir } = showoffConfig;
const mapper = new Mapper.Bookshelf();

const wrapBookshelfErrors = (err) => {
  if(
    err instanceof models.bookshelf.NotFoundError ||
    err instanceof models.bookshelf.EmptyError ||
    err instanceof models.bookshelf.NoRowsUpdatedError ||
    err instanceof models.bookshelf.NoRowsDeletedError
  ) {
    throw httpErrors.NotFound();
  }
  throw err;
};

const renderFrame = (frameJson) =>
  frameViews
    .render(frameJson.attributes)
    .catch(err => `<p style="color: red;">
        Error rendering frame content.
      </p>
      <pre>${escape(err.message)}</pre>`)
    .then(renderedContent =>
      _.merge({}, frameJson, { attributes: { renderedContent } }));

const renderFrames = (framesJson) => Promise.all(framesJson.map(renderFrame));

const postNotebookSchema = Joi.object().keys({
  data: Joi.object().keys({
    type: Joi.string().valid(['notebooks']),
    attributes: Joi.object().keys({
      pinned: Joi.boolean().optional(),
      progress: Joi.number().optional(),
      title: Joi.string(),
    }),
    // TODO: Schema for relationships
    relationships: Joi.object().optional(),
  }),
  meta: Joi.object().optional(),
});

const patchNotebookSchema = Joi.object().keys({
  data: Joi.object().keys({
    type: Joi.string().valid(['notebooks']),
    id: Joi.string().regex(/^[0-9]+$/, 'numbers'),
    attributes: Joi.object().keys({
      pinned: Joi.boolean().optional(),
      progress: Joi.number().optional(),
      title: Joi.string().optional(),
    }),
    // TODO: Schema for relationships
    relationships: Joi.object().optional(),
  }),
  // TODO: Validate the "included" field
  meta: Joi.object().optional(),
});

const broadcastNotebook = (notebook) => {
  global.wss.fireNotebookUpdate(notebook);
  return notebook;
};

// GET /api/v2/notebooks
const indexNotebooks = (req, res) =>
  Promise.resolve(models('Notebook'))
    .then(notebooks => notebooks.fetchJsonApi({
      include: req.jsonApi.include,
      require: true,
    }))
    .then(notebooks => mapper.map(notebooks, 'notebooks', { enableLinks: false }))
    .then(notebooks => res.json(notebooks));

// POST /api/v2/notebooks
const createNotebook = (req, res) =>
  Joi.validate(req.body, postNotebookSchema, { presence: 'required' })
    .catch(err => { throw httpErrors.BadRequest(err.message); })
    .then((body) =>
      new Promise((resolve) => resolve(body.data.attributes))
        .then(attrs => models('Notebook').forge(attrs).save())
        .then(notebook => res.status(201).json(
          mapper.map(notebook, 'notebooks', { enableLinks: false })))
    );

// GET /api/v2/notebooks/104
const showNotebook = (req, res) =>
  new Promise(resolve => resolve(parseInt(req.params.id, 10)))
    .then(id => models('Notebook').where({ id }))
    .then(notebook => notebook.fetchJsonApi({
      include: req.jsonApi.include,
      require: true,
    }, false))
    .catch(wrapBookshelfErrors)
    .then(notebook => mapper.map(notebook, 'notebooks', { enableLinks: false }))
    .then(notebookJson => {
      if(!notebookJson.data.relationships) {
        return notebookJson;
      }

      return renderFrames(_.filter(notebookJson.included, { type: 'frames' }))
        .then(framesJson => _.assign({}, notebookJson, {
          included: _.reject(notebookJson.included, { type: 'frames' }).concat(framesJson)
        }))
        .then((framesJson) => {
          framesJson.included.forEach((frame) => {
            delete frame.attributes.notebookId;
            frame.relationships = {
              notebook: {
                data: {
                  type: notebookJson.data.type,
                  id: notebookJson.data.id,
                }
              }
            };
          });
          return framesJson;
        });
    })
    .then(notebookJson => res.json(notebookJson));

// PATCH /api/v2/notebooks/104
const updateNotebook = (req, res) =>
  Joi.validate(req.body, patchNotebookSchema, { presence: 'required' })
    .catch(err => { throw httpErrors.BadRequest(err.message); })
    .then((body) => models.bookshelf.transaction((t) => {
      const id = parseInt(req.params.id, 10);
      return models('Notebook').where({ id }).fetch({ require: true, transacting: t })
        .then(notebook => notebook.save(body.data.attributes, { transacting: t }))
        .then(() => {
          if(!body.meta || !body.meta.included) {
            return null;
          }
          const tags = body.meta.included
            .filter(inc => inc.type === 'tags')
            .map(tag => ({ name: tag.attributes.name, notebookId: id }));
          return models('Tag').where({ notebookId: id }).destroy({ transacting: t })
            .then(() => Promise.all(tags.map(tag => models('Tag').forge(tag).save(null, { transacting: t }))));
        })
        .then(() => {
          const withRelated = [];
          if(req.jsonApi.include.includes('tags')) {
            withRelated.push('tags');
          }
          return models('Notebook')
            .where({ id })
            .fetch({ withRelated, require: true, transacting: t });
        })
        .then(notebook => mapper.map(notebook, 'notebooks', { enableLinks: false }))
        .then(notebook => {
          if(notebook.included) {
            notebook.included.forEach(inc => {
              delete inc.attributes.notebookId;

              inc.relationships = {
                notebook: {
                  data: {
                    type: notebook.data.type,
                    id: notebook.data.id,
                  }
                }
              };
            });
          }
          return notebook;
        })
        .then(broadcastNotebook)
        .then(notebook => res.json(notebook))
        .catch(err => t.rollback().catch(() => {}).then(() => { throw err; }));
    }));

// DELETE /api/v2/notebooks/50
const destroyNotebook = (req, res) =>
  new Promise(resolve => resolve(parseInt(req.params.id, 10)))
    .then((id) => models('Notebook').forge({ pinned: false, id }).destroy({ require: true })
      .then(() => res.status(204).send())
      .catch(wrapBookshelfErrors)
    );

// DELETE /api/v2/notebooks/2/frames
const destroyNotebookFrames = (req, res) =>
  new Promise(resolve => resolve(parseInt(req.params.id, 10)))
    .then((notebookId) => models('Frame').where({ notebookId }).destroy()
      .then(() => res.status(204).send())
    );

const upload = multer({ dest: path.join(uploadDir, 'tmp') }).single('file');

const validateFilename = (filename) => new Promise((resolve) => {
  if(filename.match(/^[.\-\w]+$/) && filename.match(/[-\w]/)) {
    resolve(filename);
    return;
  }
  throw httpErrors.BadRequest('invalid filename');
});

const handleFileUploadRequest = (processFile) => (req, res) =>
  new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if(err) {
        reject(err);
        return;
      }
      resolve(req.file);
    });
  })
    .then(file =>
      validateFilename(file.originalname)
        .then(() => {
          const destDir = path.join(uploadDir, 'notebooks', req.params.id, 'files');
          return fs.ensureDir(destDir)
            .then(() => processFile(file, destDir))
            .then(() => {
              const attrs = { notebookId: req.params.id, filename: file.originalname };
              return models('File').forge(attrs).where(attrs).upsert();
            });
        })
        .then(() => null).catch(err => err)
        .then(err => fs.remove(file.path).then(() => (err ? Promise.reject(err) : null)))
    )
    .then(() => res.status(200).send({}));

// PUT /api/v2/notebooks/42/files
const replaceNotebookFile = handleFileUploadRequest((file, destDir) =>
  fs.copy(file.path, path.join(destDir, file.originalname))
);

// PATCH /api/v2/notebooks/42/files
const appendNotebookFile = handleFileUploadRequest((file, destDir) => {
  const destFile = path.join(destDir, file.originalname);
  const readStream = fs.createReadStream(file.path);
  const writeStream = fs.createWriteStream(destFile, { flags: 'a' });
  readStream.pipe(writeStream);
  readStream.on('end', () => {
    writeStream.end();
  });
  return new Promise((resolve) => {
    writeStream.on('finish', () => { resolve(); });
  });
});

const router = Router();

router.use(express.static(path.join(uploadDir, 'notebooks')));

router.route('/')
  .get(indexNotebooks)
  .post(createNotebook);
router.route('/:id')
  .get(showNotebook)
  .patch(updateNotebook)
  .delete(destroyNotebook);
router.route('/:id/frames')
  .delete(destroyNotebookFrames);
router.route('/:id/files')
  .put(replaceNotebookFile)
  .patch(appendNotebookFile);

export default router;
