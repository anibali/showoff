exports.up = function(knex) {
  return knex.schema.createTable('sessions', (table) => {
    table.string('sid').notNullable().primary();
    table.json('sess').notNullable();
    table.timestamp('expired').notNullable();

    table.index('expired', 'sessions_expired_index', 'btree');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sessions');
};
