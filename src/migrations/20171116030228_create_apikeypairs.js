exports.up = function(knex) {
  return knex.schema.createTable('apikeypairs', (table) => {
    table.increments('id').primary();
    table.dateTime('createdAt').notNullable();
    table.dateTime('updatedAt').notNullable();
    table.string('publicKey').notNullable();
    table.string('secretKeyHash').notNullable();
    table.string('secretKeySalt').notNullable();
    table.integer('userId')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('apikeypairs');
};
