export default (bookshelf) =>
  bookshelf.model('User', {
    tableName: 'users',
    hasTimestamps: ['createdAt', 'updatedAt'],
  });
