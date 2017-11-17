exports.up = function(knex) {
  return knex.schema.createTable('api_keys', (table) => {
    table.string('id').notNullable().primary();
    table.dateTime('createdAt').notNullable();
    table.dateTime('updatedAt').notNullable();
    table.string('publicKey').notNullable();
    table.integer('userId')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('api_keys');
};
