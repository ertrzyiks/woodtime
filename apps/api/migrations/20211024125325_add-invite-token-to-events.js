
exports.up = function(knex) {
  return knex.schema.alterTable('events', table => {
    table.string('invite_token', 128).nullable()
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('events', table => {
    table.dropColumn('invite_token');
  })
};
