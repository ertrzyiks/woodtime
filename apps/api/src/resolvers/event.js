const { AuthenticationError } = require("apollo-server-express");

const knex = require("../../knex");

module.exports = async (_, { id }, context) => {
  if (!context.user) {
    throw new AuthenticationError
  }

  const rows = await knex
    .select("id", "name", "type", "invite_token", "checkpoint_count","virtual_challenge_id", "created_at", "updated_at")
    .from("events")
    .where({ id })

  if (rows.length <= 0) {
    return null
  }

  const event = rows[0]
  const { virtual_challenge_id, ...rest } = event
  return {
    ...rest,
    virtual_challenge: virtual_challenge_id
      ? { id: virtual_challenge_id }
      : null
  }
};
