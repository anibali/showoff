module.exports = (bookshelf) =>
  bookshelf.model('Notebook', {
    tableName: 'notebooks',
    hasTimestamps: ['createdAt', 'updatedAt'],
    frames: function() {
      return this.hasMany('Frame', 'notebookId');
    }
  });
