exports.up = function(knex) {
  return knex.schema.createTable('notebooks', (table) => {
    table.increments('id').primary();
    table.dateTime('createdAt').notNullable();
    table.dateTime('updatedAt').notNullable();
    table.string('title');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('notebooks');
};
