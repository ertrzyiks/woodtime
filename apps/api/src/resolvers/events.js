const knex = require("../../knex");

module.exports = async () => {
  return knex
    .select("id", "name", "checkpoint_count", "created_at", "updated_at")
    .from("events");
};
