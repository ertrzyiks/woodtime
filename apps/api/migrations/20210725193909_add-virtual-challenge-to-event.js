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
        table.integer("virtual_challenge_id").nullable()
        table.foreign("virtual_challenge_id").references("virtual_challenges.id");
      });
    })
    .then(() => {
      return knex.raw(
        "INSERT INTO events(id, name, type, checkpoint_count, virtual_challenge_id, created_at, updated_at) SELECT id, name, type, checkpoint_count, null, created_at, updated_at FROM old_events"
      );
    })
    .then(() => {
      return knex.schema.dropTable("old_events");
    });
};

exports.down = function (knex) {
  return knex.schema.table("events", (table) => {
    table.dropColumn("virtual_challenge_id");
  });
};
