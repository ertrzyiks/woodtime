const knex = require("../../knex");

module.exports = async (_, {}, { user }) => {
  return knex
    .select(
      "events.id",
      "events.name",
      "events.type",
      "events.virtual_challenge_id",
      "events.checkpoint_count",
      "events.created_at",
      "events.updated_at")
    .from("events")
    .join('participants', 'events.id', '=', 'participants.event_id')
    .where('participants.user_id', user.id)
};
