const { DataSource } = require('apollo-datasource')
const knex = require("../../knex")
const { v4: uuidv4 } = require('uuid')

class Database extends DataSource {
  initialize(config) {
    this.context = config.context
  }

  async findUserById(id) {
    const user = await knex
      .select('id', 'name')
      .from('users')
      .where({ id })

    return user[0]
  }

  findEventsForUser({ id }) {
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
      .where('participants.user_id', id)
  }

  async findEventById(id) {
    const rows = await knex
      .select("id", "name", "type", "invite_token", "checkpoint_count","virtual_challenge_id", "created_at", "updated_at")
      .from("events")
      .where({ id })

    if (rows.length <= 0) {
      return null
    }

    return rows[0]
  }

  deleteEventById(id) {
    return knex('events').where({ id }).del();
  }

  async createEvent({ name, type, checkpointCount, virtualChallengeId = null}) {
    const event = {
      name,
      type,
      checkpoint_count: checkpointCount,
      invite_token: uuidv4(),
      virtual_challenge_id: virtualChallengeId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const ids = await knex("events").insert(event)

    return {
      id: ids[0],
      ...event
    }
  }

  async createParticipant({ userId, eventId }) {
    const participant = {
      user_id: userId,
      event_id: eventId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const ids = await knex('participants').insert(participant)

    return {
      id: ids[0],
      ...participant
    }
  }
}

module.exports = Database
