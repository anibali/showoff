export default (bookshelf) => {
  const Notebook = bookshelf.Model.extend(
    {
      tableName: 'notebooks',
      hasTimestamps: ['createdAt', 'updatedAt'],
      frames: function() {
        return this.hasMany('Frame', 'notebookId');
      },
      tags: function() {
        return this.hasMany('Tag', 'notebookId');
      },
    },
    {
      dependents: ['frames', 'tags'],
    }
  );

  return bookshelf.model('Notebook', Notebook);
};
