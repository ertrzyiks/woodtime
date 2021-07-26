const tableName = "event_types";

exports.up = function(knex) {
  const eventTypes = [
    { id: 3, type: "virtual" },
  ]
  return knex(tableName).insert(eventTypes)
};

exports.down = function(knex) {
  return knex(tableName).where({ id: 3 }).delete()
};
