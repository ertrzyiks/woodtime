const { v4: uuidv4 } = require('uuid')
const knex = require("../../knex");

module.exports = async (_, { name, checkpointCount, type }) => {
  const event = {
    name,
    type,
    checkpoint_count: checkpointCount,
    invite_token: uuidv4(),
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
