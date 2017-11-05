import path from 'path';
import fs from 'fs-extra';
import showoffConfig from '../config/showoff';

const { uploadDir } = showoffConfig;

export default (bookshelf) => {
  const Notebook = bookshelf.Model.extend(
    {
      tableName: 'notebooks',
      initialize: function() {
        this.on('destroying', (model) => {
          const notebookId = model.attributes.id;
          if(notebookId) {
            return fs.remove(path.join(uploadDir, 'notebooks', notebookId.toString()));
          }
          throw new Error('batch delete not supported for "notebooks" table');
        });
      },
      hasTimestamps: ['createdAt', 'updatedAt'],
      frames: function() {
        return this.hasMany('Frame', 'notebookId');
      },
      tags: function() {
        return this.hasMany('Tag', 'notebookId');
      },
      files: function() {
        return this.hasMany('File', 'notebookId');
      },
    },
    {
      dependents: ['frames', 'tags', 'files'],
    }
  );

  return bookshelf.model('Notebook', Notebook);
};
