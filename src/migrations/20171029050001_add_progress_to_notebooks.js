exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('notebooks', (table) => {
      table.float('progress').notNullable().defaultTo(-1);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('notebooks', (table) => {
      table.dropColumn('progress');
    })
  ]);
};
