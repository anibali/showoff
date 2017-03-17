module.exports = (bookshelf) => {
  const Notebook = bookshelf.Model.extend(
    {
      tableName: 'notebooks',
      hasTimestamps: ['createdAt', 'updatedAt'],
      frames: function() {
        return this.hasMany('Frame', 'notebookId');
      }
    },
    {
      dependents: ['frames']
    }
  );

  return bookshelf.model('Notebook', Notebook);
};
