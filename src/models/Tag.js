export default (bookshelf) =>
  bookshelf.model('Tag', {
    tableName: 'tags',
    hasTimestamps: ['createdAt', 'updatedAt'],
    notebook: function() {
      return this.belongsTo('Notebook', 'notebookId');
    },
  });
