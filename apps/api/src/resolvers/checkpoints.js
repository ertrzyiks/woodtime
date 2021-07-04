const knex = require("../../knex");

module.exports = async ({ id }) => {
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
    });
};
