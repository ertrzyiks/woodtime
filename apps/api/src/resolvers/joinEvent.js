const { AuthenticationError } = require("apollo-server-express");
const { v4: uuidv4 } = require('uuid')
const knex = require("../../knex");

module.exports = async (_, { id, token }, context) => {
  if (!context.user) {
    throw new AuthenticationError
  }

  const rows = await knex
    .select("id", "name", "type", "invite_token", "checkpoint_count","virtual_challenge_id", "created_at", "updated_at")
    .from("events")
    .where({ id })

  if (rows.length === 0) {
    return {
      success: false
    }
  }

  const event = rows[0]

  const participants = await knex
    .select("id")
    .from("participants")
    .where({ user_id: context.user.id, event_id: event.id })

  if (participants.length > 0) {
    return {
      success: true,
      event
    }
  }

  if (token !== event.invite_token) {
    return {
      success: false
    }
  }

  await knex('participants').insert({
    user_id: context.user.id,
    event_id: event.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  return {
    success: true,
    event,
  };
};
