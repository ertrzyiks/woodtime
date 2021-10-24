const knex = require("../../knex");
const { AuthenticationError } = require("apollo-server-express");

module.exports = async ({ id }, {}, context) => {
  if (!context.user) {
    throw new AuthenticationError
  }

  return knex
    .select(
      "id",
      "cp_id",
      "event_id",
      "cp_code",
      "skipped",
      "skip_reason",
      "created_at",
      "updated_at"
    )
    .from("checkpoints")
    .where({
      event_id: id,
    })
}
