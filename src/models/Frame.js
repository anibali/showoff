module.exports = (bookshelf) =>
  bookshelf.model('Frame', {
    tableName: 'frames',
    jsonColumns: ['content'],
    notebook: function() {
      this.belongsTo('Notebook', 'notebookId');
    }
  });
