export default (bookshelf) =>
  bookshelf.model('User', {
    tableName: 'users',
    hasTimestamps: ['createdAt', 'updatedAt'],
    apiKeyPairs: function() {
      return this.hasMany('ApiKeyPair', 'userId');
    },
  },
  {
    dependents: ['apiKeyPairs'],
  });
