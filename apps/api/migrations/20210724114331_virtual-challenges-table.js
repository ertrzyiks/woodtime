exports.up = function (knex) {
  return knex.schema.createTable("virtual_challenges", function (table) {
    table.increments("id").primary();
    table.string("name");
    table.string("checkpoints");
    table.string("created_at").notNullable();
    table.string("updated_at").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("virtual_challenges");
};
