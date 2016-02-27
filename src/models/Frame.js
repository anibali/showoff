module.exports = (bookshelf) =>
  bookshelf.model('Frame', {
    tableName: 'frames',
    notebook: function() {
      this.belongsTo('Notebook');
    }
  });
