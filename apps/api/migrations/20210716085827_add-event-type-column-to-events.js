exports.up = function (knex) {
  return knex.schema
    .renameTable("events", "old_events")
    .then(() => {
      return knex.schema.createTable("events", function (table) {
        table.increments("id").primary();
        table.string("name").notNullable();
        table.integer("checkpoint_count").notNullable();
        table.string("created_at").notNullable();
        table.string("updated_at").notNullable();
        table.integer("type").notNullable().defaultTo(1);
        table.foreign("type").references("event_types.id");
      });
    })
    .then(() => {
      return knex.raw(
        "INSERT INTO events(id, name, type, checkpoint_count, created_at, updated_at) SELECT id, name, 1, checkpoint_count, created_at, updated_at FROM old_events"
      );
    })
    .then(() => {
      return knex.schema.dropTable("old_events");
    });
};

exports.down = function (knex) {
  return knex.schema.table("events", (table) => {
    table.dropColumn("type");
  });
};
