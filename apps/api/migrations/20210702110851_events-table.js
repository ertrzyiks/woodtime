exports.up = function (knex) {
  return knex.schema.createTable("events", function (table) {
    table.integer("id").primary().notNullable();
    table.string("name").notNullable();
    table.integer("checkpoint_count").notNullable();
    table.timestamp("created_at").notNullable();
    table.timestamp("updated_at").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("events");
};
