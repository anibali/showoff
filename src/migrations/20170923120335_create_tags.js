exports.up = function(knex) {
  return knex.schema.createTable('tags', (table) => {
    table.increments('id').primary();
    table.dateTime('createdAt').notNullable().defaultTo(knex.raw('now()'));
    table.dateTime('updatedAt').notNullable().defaultTo(knex.raw('now()'));
    table.string('name').notNullable();
    table.integer('notebookId')
      .unsigned()
      .references('id')
      .inTable('notebooks')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tags');
};
