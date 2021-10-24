exports.up = async function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("email").nullable();
    table.string("source").notNullable();
    table.string("created_at").notNullable();
    table.string("updated_at").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
