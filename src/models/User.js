export default (bookshelf) =>
  bookshelf.model('User', {
    tableName: 'users',
    hasTimestamps: ['createdAt', 'updatedAt'],
    apiKeys: function() {
      return this.hasMany('ApiKey', 'userId');
    },
  },
  {
    dependents: ['apiKeys'],
  });
