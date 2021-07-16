const tableName = "event_types";

exports.up = function (knex) {
  return knex.schema
    .createTable(tableName, function (table) {
      table.integer("id").primary().notNullable();
      table.string("type", 50).notNullable();
    })
    .then(() => {
      const eventTypes = [
        { id: 1, type: "score" },
        { id: 2, type: "classic" },
      ];

      return knex(tableName).insert(eventTypes);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable(tableName);
};
