exports.up = function(knex) {
  return knex.schema.createTable('notebooks', (table) => {
    table.increments('id').primary();
    table.string('title');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('notebooks');
};
