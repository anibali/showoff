export default (bookshelf) =>
  bookshelf.model('ApiKeyPair', {
    tableName: 'apikeypairs',
    hasTimestamps: ['createdAt', 'updatedAt'],
    user: function() {
      return this.belongsTo('User', 'userId');
    },
  });
