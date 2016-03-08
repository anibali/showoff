module.exports = (bookshelf) =>
  bookshelf.model('Frame', {
    tableName: 'frames',
    hasTimestamps: ['createdAt', 'updatedAt'],
    jsonColumns: ['content'],
    notebook: function() {
      this.belongsTo('Notebook', 'notebookId');
    }
  });
