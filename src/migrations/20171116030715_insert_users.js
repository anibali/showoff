const crypto = require('crypto');


exports.up = function(knex) {
  const now = new Date();

  // Internal user for requests within the backend.
  // Log in is disabled for this user.
  const internalUser = {
    username: '_internal',
    passwordHash: '',
    passwordSalt: '',
    createdAt: now,
    updatedAt: now,
  };

  // Admin user.
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminPasswordSalt = crypto.randomBytes(24).toString('base64');
  const adminPasswordHash =
    crypto.pbkdf2Sync(adminPassword, adminPasswordSalt, 5000, 72, 'sha512').toString('base64');
  const adminUser = {
    username: 'admin',
    passwordHash: adminPasswordHash,
    passwordSalt: adminPasswordSalt,
    createdAt: now,
    updatedAt: now,
  };

  const users = [internalUser, adminUser];

  return Promise.all(users.map(u => knex('users').insert(u)));
};

exports.down = function(knex) {
  return knex('users').whereIn('username', ['admin', '_internal']).del();
};
