exports.up = function(knex) {
  return knex.schema.createTable('frames', (table) => {
    table.increments('id').primary();
    table.string('title');
    table.json('content');
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
