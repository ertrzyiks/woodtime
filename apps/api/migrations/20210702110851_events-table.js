exports.up = async function (knex) {
  await knex.raw("PRAGMA foreign_keys = ON");

  return knex.schema.createTable("events", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.integer("checkpoint_count").notNullable();
    table.string("created_at").notNullable();
    table.string("updated_at").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("events");
};
