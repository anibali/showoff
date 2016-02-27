module.exports = (bookshelf) =>
  bookshelf.model('Notebook', {
    tableName: 'notebooks',
    frames: function() {
      return this.hasMany('Frame');
    }
  });
