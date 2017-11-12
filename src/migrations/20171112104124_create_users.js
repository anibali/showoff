const crypto = require('crypto');

exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.dateTime('createdAt').notNullable();
    table.dateTime('updatedAt').notNullable();
    table.string('username').notNullable();
    table.string('passwordHash').notNullable();
    table.string('passwordSalt').notNullable();
  }).then(() => {
    const password = process.env.ADMIN_PASSWORD;
    const passwordSalt = crypto.randomBytes(24).toString('base64');
    const passwordHash =
      crypto.pbkdf2Sync(password, passwordSalt, 100000, 72, 'sha512').toString('base64');
    const now = new Date();
    const adminUser = {
      username: 'admin',
      passwordHash,
      passwordSalt,
      createdAt: now,
      updatedAt: now,
    };
    return knex('users').insert(adminUser);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
