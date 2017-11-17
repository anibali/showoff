exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.dateTime('createdAt').notNullable();
    table.dateTime('updatedAt').notNullable();
    table.string('username').notNullable().unique();
    table.string('passwordHash').notNullable();
    table.string('passwordSalt').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
