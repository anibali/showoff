import path from 'path';
import fs from 'fs-extra';
import showoffConfig from '../config/showoff';

const { uploadDir } = showoffConfig;

export default (bookshelf) => bookshelf.model('File', {
  tableName: 'files',
  initialize: function() {
    this.on('destroying', (model) =>
      new Promise((resolve, reject) => {
        const { id, notebookId, filename } = model.attributes;
        if(notebookId && filename) {
          resolve(model);
          return;
        } else if(id) {
          resolve(model.fetch());
          return;
        }
        reject(new Error('batch delete not supported for "files" table'));
      }).then(modelWithAttrs => {
        if(modelWithAttrs) {
          const { notebookId, filename } = modelWithAttrs.attributes;
          return fs.remove(path.join(uploadDir, 'notebooks', notebookId.toString(), filename));
        }
        return null;
      })
    );
  },
  hasTimestamps: ['createdAt', 'updatedAt'],
  notebook: function() {
    return this.belongsTo('Notebook', 'notebookId');
  },
});
