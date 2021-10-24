const { AuthenticationError } = require("apollo-server-express");

const knex = require("../../knex");

module.exports = async (_, {}, context) => {
  if (!context.user) {
    throw new AuthenticationError
  }

  return knex
    .select("id", "name",  "type", "virtual_challenge_id", "checkpoint_count", "created_at", "updated_at")
    .from("events")
};
