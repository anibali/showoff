export default (bookshelf) =>
  bookshelf.model('Frame', {
    tableName: 'frames',
    hasTimestamps: ['createdAt', 'updatedAt'],
    jsonColumns: ['content'],
    notebook: function() {
      return this.belongsTo('Notebook', 'notebookId');
    },
  });
