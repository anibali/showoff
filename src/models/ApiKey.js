export default (bookshelf) =>
  bookshelf.model('ApiKey', {
    tableName: 'api_keys',
    hasTimestamps: ['createdAt', 'updatedAt'],
    user: function() {
      return this.belongsTo('User', 'userId');
    },
  });
