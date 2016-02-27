exports.up = function(knex) {
  return knex.schema.createTable('frames', function(table) {
    table.increments('id').primary();
    table.string('title');
    table.text('content');
    table.integer('notebook_id').unsigned().references('id').inTable('notebooks');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('frames');
};
