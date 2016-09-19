exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('frames', (table) => {
      table.integer('x').notNullable().defaultTo(0);
      table.integer('y').notNullable().defaultTo(0);
      table.integer('width').notNullable().defaultTo(480);
      table.integer('height').notNullable().defaultTo(360);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('frames', (table) => {
      table.dropColumn('x');
      table.dropColumn('y');
      table.dropColumn('width');
      table.dropColumn('height');
    })
  ]);
};
