const { DataSource } = require('apollo-datasource')
const knex = require("../../knex")
const { v4: uuidv4 } = require('uuid')

const resolveDates = (obj) => {
  const { created_at, updated_at, ...rest } = obj
  return {
    ...rest,
    created_at: new Date(created_at),
    updated_at: new Date(updated_at)
  }
}

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

  async findEventsForUser({ id }) {
    const events = await knex
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

    return events.map(event => resolveDates(event))
  }

  async findEventById(id) {
    const rows = await knex
      .select("id", "name", "type", "invite_token", "checkpoint_count","virtual_challenge_id", "created_at", "updated_at")
      .from("events")
      .where({ id })

    if (rows.length <= 0) {
      return null
    }

    const event = rows[0]

    return resolveDates(event)
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
      ...resolveDates(event)
    }
  }

  async findParticipant({ userId, eventId }) {
    const participants = await knex
      .select("id")
      .from("participants")
      .where({ user_id: userId, event_id: eventId })

    return participants[0]
  }

  findParticipantsForEvent(id) {
    return knex
      .select('users.id', 'users.name')
      .from("participants")
      .join('users', 'users.id', '=', 'participants.user_id')
      .where({ event_id: id })
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

  async createCheckpoint({ eventId, cpId, cpCode, skipped, skipReason }) {
    const checkpoint = {
      event_id: eventId,
      cp_id: cpId,
      cp_code: cpCode || null,
      skipped,
      skip_reason: skipReason || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const ids = await knex("checkpoints").insert(checkpoint)

    return {
      id: ids[0],
      ...resolveDates(checkpoint)
    }
  }

  deleteCheckpoint(id) {
    return knex("checkpoints").where({ id }).del()
  }

  async findCheckpointById(id) {
    const rows = await knex
      .select("id", "event_id")
      .from("checkpoints")
      .where({ id })

    if (rows.length <= 0) {
      return null
    }

    const checkpoint = rows[0]
    return resolveDates(checkpoint)
  }

  async findCheckpointsForEvent(id) {
    const checkpoints = await knex
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
      })

    return checkpoints.map(checkpoint => resolveDates(checkpoint))
  }

  async findFriendForUser({ id }) {
    const subquery = knex.select('event_id').from('participants').where({ user_id: id })
    const friends = await knex
      .select('users.id', 'name')
      .distinct('user_id')
      .join('users', 'users.id', '=', 'participants.user_id')
      .from('participants')
      .where('event_id', 'in', subquery)
      .andWhereNot({ user_id: id })
      .limit(10)

    return friends
  }

  async isFriendForUser({ id, friendId }) {
    const subquery = knex.select('event_id').from('participants').where({ user_id: id })

    const friends = await knex
      .select('users.id')
      .join('users', 'users.id', '=', 'participants.user_id')
      .from('participants')
      .where('event_id', 'in', subquery)
      .andWhere({ user_id: friendId })

    return friends.length > 0
  }

  // RxDB Replication Methods

  async pullEvents({ limit, minUpdatedAt }) {
    const minDate = new Date(minUpdatedAt).getTime();
    const events = await knex
      .select(
        'id',
        'name',
        'type',
        'invite_token',
        'checkpoint_count',
        'created_at',
        'updated_at',
        'deleted',
        '_modified'
      )
      .from('events')
      .where('_modified', '>=', minDate)
      .orderBy('_modified', 'asc')
      .limit(limit);

    return events.map((event) => ({
      ...event,
      deleted: Boolean(event.deleted),
    }));
  }

  async getEventsCheckpoint() {
    const result = await knex
      .select('_modified')
      .from('events')
      .orderBy('_modified', 'desc')
      .limit(1);

    return {
      lastModified: result.length > 0 ? result[0]._modified : 0,
    };
  }

  async pushEvents(events) {
    const results = [];

    for (const event of events) {
      // Check if event exists
      const existing = await knex
        .select('id')
        .from('events')
        .where({ id: event.id })
        .first();

      const eventData = {
        name: event.name,
        type: event.type,
        invite_token: event.invite_token,
        checkpoint_count: event.checkpoint_count,
        created_at: event.created_at,
        updated_at: event.updated_at,
        deleted: event.deleted ? 1 : 0,
        _modified: event._modified,
      };

      if (existing) {
        // Update existing event
        await knex('events').where({ id: event.id }).update(eventData);
      } else {
        // Insert new event (handle temporary IDs)
        if (event.id < 0) {
          // Generate new ID for temporary IDs
          const [newId] = await knex('events').insert(eventData);
          event.id = newId;
        } else {
          await knex('events').insert({ id: event.id, ...eventData });
        }
      }

      // Fetch the updated/created event
      const updated = await knex
        .select(
          'id',
          'name',
          'type',
          'invite_token',
          'checkpoint_count',
          'created_at',
          'updated_at',
          'deleted',
          '_modified'
        )
        .from('events')
        .where({ id: event.id })
        .first();

      results.push({
        ...updated,
        deleted: Boolean(updated.deleted),
      });
    }

    return results;
  }

  async pullCheckpoints({ limit, minUpdatedAt }) {
    const minDate = new Date(minUpdatedAt).getTime();
    const checkpoints = await knex
      .select(
        'id',
        'event_id',
        'cp_id',
        'cp_code',
        'skipped',
        'skip_reason',
        'created_at',
        'updated_at',
        'deleted',
        '_modified'
      )
      .from('checkpoints')
      .where('_modified', '>=', minDate)
      .orderBy('_modified', 'asc')
      .limit(limit);

    return checkpoints.map((checkpoint) => ({
      ...checkpoint,
      skipped: Boolean(checkpoint.skipped),
      deleted: Boolean(checkpoint.deleted),
    }));
  }

  async getCheckpointsCheckpoint() {
    const result = await knex
      .select('_modified')
      .from('checkpoints')
      .orderBy('_modified', 'desc')
      .limit(1);

    return {
      lastModified: result.length > 0 ? result[0]._modified : 0,
    };
  }

  async pushCheckpoints(checkpoints) {
    const results = [];

    for (const checkpoint of checkpoints) {
      // Check if checkpoint exists
      const existing = await knex
        .select('id')
        .from('checkpoints')
        .where({ id: checkpoint.id })
        .first();

      const checkpointData = {
        event_id: checkpoint.event_id,
        cp_id: checkpoint.cp_id,
        cp_code: checkpoint.cp_code,
        skipped: checkpoint.skipped ? 1 : 0,
        skip_reason: checkpoint.skip_reason,
        created_at: checkpoint.created_at,
        updated_at: checkpoint.updated_at,
        deleted: checkpoint.deleted ? 1 : 0,
        _modified: checkpoint._modified,
      };

      if (existing) {
        // Update existing checkpoint
        await knex('checkpoints')
          .where({ id: checkpoint.id })
          .update(checkpointData);
      } else {
        // Insert new checkpoint (handle temporary IDs)
        if (checkpoint.id < 0) {
          // Generate new ID for temporary IDs
          const [newId] = await knex('checkpoints').insert(checkpointData);
          checkpoint.id = newId;
        } else {
          await knex('checkpoints').insert({
            id: checkpoint.id,
            ...checkpointData,
          });
        }
      }

      // Fetch the updated/created checkpoint
      const updated = await knex
        .select(
          'id',
          'event_id',
          'cp_id',
          'cp_code',
          'skipped',
          'skip_reason',
          'created_at',
          'updated_at',
          'deleted',
          '_modified'
        )
        .from('checkpoints')
        .where({ id: checkpoint.id })
        .first();

      results.push({
        ...updated,
        skipped: Boolean(updated.skipped),
        deleted: Boolean(updated.deleted),
      });
    }

    return results;
  }

  async pullVirtualChallenges({ limit, minUpdatedAt }) {
    const minDate = new Date(minUpdatedAt).getTime();
    const challenges = await knex
      .select(
        'id',
        'name',
        'checkpoints',
        'created_at',
        'updated_at',
        'deleted',
        '_modified'
      )
      .from('virtual_challenges')
      .where('_modified', '>=', minDate)
      .orderBy('_modified', 'asc')
      .limit(limit);

    return challenges.map((challenge) => ({
      ...challenge,
      deleted: Boolean(challenge.deleted),
    }));
  }

  async getVirtualChallengesCheckpoint() {
    const result = await knex
      .select('_modified')
      .from('virtual_challenges')
      .orderBy('_modified', 'desc')
      .limit(1);

    return {
      lastModified: result.length > 0 ? result[0]._modified : 0,
    };
  }

  async pushVirtualChallenges(challenges) {
    const results = [];

    for (const challenge of challenges) {
      // Check if challenge exists
      const existing = await knex
        .select('id')
        .from('virtual_challenges')
        .where({ id: challenge.id })
        .first();

      const challengeData = {
        name: challenge.name,
        checkpoints: challenge.checkpoints,
        created_at: challenge.created_at,
        updated_at: challenge.updated_at,
        deleted: challenge.deleted ? 1 : 0,
        _modified: challenge._modified,
      };

      if (existing) {
        // Update existing challenge
        await knex('virtual_challenges')
          .where({ id: challenge.id })
          .update(challengeData);
      } else {
        // Insert new challenge (handle temporary IDs)
        if (challenge.id < 0) {
          // Generate new ID for temporary IDs
          const [newId] = await knex('virtual_challenges').insert(
            challengeData
          );
          challenge.id = newId;
        } else {
          await knex('virtual_challenges').insert({
            id: challenge.id,
            ...challengeData,
          });
        }
      }

      // Fetch the updated/created challenge
      const updated = await knex
        .select(
          'id',
          'name',
          'checkpoints',
          'created_at',
          'updated_at',
          'deleted',
          '_modified'
        )
        .from('virtual_challenges')
        .where({ id: challenge.id })
        .first();

      results.push({
        ...updated,
        deleted: Boolean(updated.deleted),
      });
    }

    return results;
  }
}

module.exports = Database
