exports.up = function (knex) {
  return knex.schema.createTable("checkpoints", function (table) {
    table.integer("id").primary().notNullable();
    table.integer("cp_id").notNullable();
    table.integer("event_id").notNullable();
    table.string("cp_code");
    table.boolean("skipped");
    table.string("skip_reason");
    table.timestamp("created_at").notNullable();
    table.timestamp("updated_at").notNullable();
    table.foreign("event_id").references("events.id");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("checkpoints");
};
