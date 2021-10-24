const { AuthenticationError } = require("apollo-server-express");

const knex = require("../../knex");

module.exports = async (_, {}, context) => {
  if (!context.user) {
    throw new AuthenticationError
  }

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
    .where('participants.user_id', context.user.id)
};
