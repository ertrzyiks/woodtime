exports.up = function (knex) {
  return knex.schema.createTable("participants", function (table) {
    table.increments("id").primary()
    table.integer("user_id")
    table.integer("event_id")
    table.string("created_at").notNullable()
    table.string("updated_at").notNullable()
    table.foreign("user_id").references("users.id").onDelete("CASCADE")
    table.foreign("event_id").references("events.id").onDelete("CASCADE")
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable("participants")
}
