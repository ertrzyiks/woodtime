const { AuthenticationError } = require("apollo-server-express");

const knex = require("../../knex");

module.exports = async (_, { id }, context) => {
  if (!context.user) {
    throw new AuthenticationError
  }

  const rows = await knex
    .from("virtual_challenges")
    .select("id", "name", "checkpoints", "created_at", "updated_at")
    .where({ id })

  if (rows.length <= 0) {
    throw new Error('NOT FOUND')
  }

  const virtualChallenge = rows[0]
  const checkpoints = JSON.parse(virtualChallenge.checkpoints)

  const event = {
    name: virtualChallenge.name,
    type: 3,
    virtual_challenge_id: id,
    checkpoint_count: checkpoints.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const createdEventIds = await knex("events").insert(event);

  return {
    success: true,
    event: { id: createdEventIds[0], ...event },
  };
};
