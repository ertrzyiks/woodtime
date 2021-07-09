const knex = require("../../knex");

module.exports = async (_, { id }) => {
  const rows = await knex
    .select("id", "name", "checkpoint_count", "created_at", "updated_at")
    .from("events")
    .where({ id });

  if (rows.length > 0) {
    return rows[0];
  }

  return null;
};
