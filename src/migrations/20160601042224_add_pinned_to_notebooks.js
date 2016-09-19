exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('notebooks', (table) => {
      table.boolean('pinned').notNullable().defaultTo(false);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('notebooks', (table) => {
      table.dropColumn('pinned');
    })
  ]);
};
