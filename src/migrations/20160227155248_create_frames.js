exports.up = function(knex) {
  return knex.schema.createTable('frames', function(table) {
    table.increments('id').primary();
    table.string('title');
    table.text('content');
    table.integer('notebookId')
      .unsigned()
      .references('id')
      .inTable('notebooks')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('frames');
};
