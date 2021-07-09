exports.up = function (knex) {
  return knex.schema.createTable("checkpoints", function (table) {
    table.increments("id").primary();
    table.integer("cp_id").notNullable();
    table.string("cp_code");
    table.integer("event_id");
    table.boolean("skipped");
    table.string("skip_reason");
    table.string("created_at").notNullable();
    table.string("updated_at").notNullable();
    table.foreign("event_id").references("events.id").onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("checkpoints");
};
