const { AuthenticationError } = require("apollo-server-express");

const knex = require("../../knex");

module.exports = async (_, { name, checkpointCount, type }, context) => {
  if (!context.user) {
    throw new AuthenticationError
  }

  const event = {
    name,
    type,
    checkpoint_count: checkpointCount,
    virtual_challenge_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const createdEventIds = await knex("events").insert(event)

  const eventId = createdEventIds[0]

  await knex('participants').insert({
    user_id: context.user.id,
    event_id: eventId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  return {
    success: true,
    event: { id: eventId, ...event },
  };
};
