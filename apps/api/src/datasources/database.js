const { DataSource } = require("apollo-datasource");
const knex = require("../../knex");
const { v4: uuidv4 } = require("uuid");

const resolveDates = (obj) => {
  const { created_at, updated_at, ...rest } = obj;
  return {
    ...rest,
    created_at: new Date(created_at),
    updated_at: new Date(updated_at),
  };
};

class Database extends DataSource {
  constructor(knexInstance = knex) {
    super();
    this.knex = knexInstance;
  }
  initialize(config) {
    this.context = config.context;
  }

  async findUserById(id) {
    const user = await this.knex
      .select("id", "name")
      .from("users")
      .where({ id });

    return user[0];
  }

  async findEventsForUser({ id }) {
    const events = await this.knex
      .select(
        "events.id",
        "events.name",
        "events.type",
        "events.virtual_challenge_id",
        "events.checkpoint_count",
        "events.created_at",
        "events.updated_at",
      )
      .from("events")
      .join("participants", "events.id", "=", "participants.event_id")
      .where("participants.user_id", id);

    return events.map((event) => resolveDates(event));
  }

  async findEventById(id) {
    const rows = await this.knex
      .select(
        "id",
        "name",
        "type",
        "invite_token",
        "checkpoint_count",
        "virtual_challenge_id",
        "created_at",
        "updated_at",
      )
      .from("events")
      .where({ id });

    if (rows.length <= 0) {
      return null;
    }

    const event = rows[0];

    return resolveDates(event);
  }

  deleteEventById(id) {
    return this.knex("events").where({ id }).del();
  }

  async createEvent({
    id,
    name,
    type,
    checkpointCount,
    virtualChallengeId = null,
  }) {
    const event = {
      id,
      name,
      type,
      checkpoint_count: checkpointCount,
      invite_token: uuidv4(),
      virtual_challenge_id: virtualChallengeId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const ids = await this.knex("events").insert(event);

    return {
      id: ids[0],
      ...resolveDates(event),
    };
  }

  async findParticipant({ userId, eventId }) {
    const participants = await this.knex
      .select("id")
      .from("participants")
      .where({ user_id: userId, event_id: eventId });

    return participants[0];
  }

  findParticipantsForEvent(id) {
    return this.knex
      .select("users.id", "users.name")
      .from("participants")
      .join("users", "users.id", "=", "participants.user_id")
      .where({ event_id: id });
  }

  async createParticipant({ userId, eventId }) {
    const participant = {
      user_id: userId,
      event_id: eventId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const ids = await this.knex("participants").insert(participant);

    return {
      id: ids[0],
      ...participant,
    };
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
    };

    const ids = await this.knex("checkpoints").insert(checkpoint);

    return {
      id: ids[0],
      ...resolveDates(checkpoint),
    };
  }

  deleteCheckpoint(id) {
    return this.knex("checkpoints").where({ id }).del();
  }

  async findCheckpointById(id) {
    const rows = await this.knex
      .select("id", "event_id")
      .from("checkpoints")
      .where({ id });

    if (rows.length <= 0) {
      return null;
    }

    const checkpoint = rows[0];
    return resolveDates(checkpoint);
  }

  async findCheckpointsForEvent(id) {
    const checkpoints = await this.knex
      .select(
        "id",
        "cp_id",
        "event_id",
        "cp_code",
        "skipped",
        "skip_reason",
        "created_at",
        "updated_at",
      )
      .from("checkpoints")
      .where({
        event_id: id,
      });

    return checkpoints.map((checkpoint) => resolveDates(checkpoint));
  }

  async findFriendForUser({ id }) {
    const subquery = this.knex
      .select("event_id")
      .from("participants")
      .where({ user_id: id });
    const friends = await this.knex
      .select("users.id", "name")
      .distinct("user_id")
      .join("users", "users.id", "=", "participants.user_id")
      .from("participants")
      .where("event_id", "in", subquery)
      .andWhereNot({ user_id: id })
      .limit(10);

    return friends;
  }

  async isFriendForUser({ id, friendId }) {
    const subquery = this.knex
      .select("event_id")
      .from("participants")
      .where({ user_id: id });

    const friends = await this.knex
      .select("users.id")
      .join("users", "users.id", "=", "participants.user_id")
      .from("participants")
      .where("event_id", "in", subquery)
      .andWhere({ user_id: friendId });

    return friends.length > 0;
  }

  // RxDB Replication Methods

  async pullEvents({ limit, minUpdatedAt, userId }) {
    const minDate = new Date(minUpdatedAt).getTime();

    const query = this.knex
      .select(
        "events.id",
        "events.name",
        "events.type",
        "events.invite_token",
        "events.checkpoint_count",
        "events.created_at",
        "events.updated_at",
        "events.deleted",
        "events._modified",
      )
      .from("events")
      .join("participants", "events.id", "=", "participants.event_id")
      .andWhere("participants.user_id", userId)
      .where("events._modified", ">", minDate)
      .orderBy("events._modified", "asc")
      .limit(limit);

    const events = await query;

    return events.map((event) => ({
      ...resolveDates(event),
      deleted: Boolean(event.deleted),
    }));
  }

  async pushEvents(events, userId) {
    const results = [];

    for (const event of events) {
      // Check if event exists
      const existing = await this.knex
        .select("id")
        .from("events")
        .where({ id: event.id })
        .first();

      // For existing events, verify user is a participant
      if (existing) {
        const participant = await this.knex
          .select("id")
          .from("participants")
          .where({ user_id: userId, event_id: event.id })
          .first();

        if (!participant) {
          // Skip events where user is not a participant
          continue;
        }
      }

      const eventData = {
        name: event.name,
        type: event.type,
        checkpoint_count: event.checkpoint_count,
        created_at: new Date(event.created_at).toISOString(),
        updated_at: new Date(event.updated_at).toISOString(),
        deleted: event.deleted ? 1 : 0,
      };

      let actualId = event.id;

      if (existing) {
        // Update existing event
        await this.knex("events").where({ id: event.id }).update(eventData);
      } else {
        await this.createEvent({
          id: event.id,
          name: event.name,
          type: event.type,
          checkpointCount: event.checkpoint_count,
        });

        await this.createParticipant({
          userId,
          eventId: actualId,
        });
      }

      // Fetch the updated/created event
      const updated = await this.knex
        .select(
          "id",
          "name",
          "type",
          "invite_token",
          "checkpoint_count",
          "created_at",
          "updated_at",
          "deleted",
          "_modified",
        )
        .from("events")
        .where({ id: actualId })
        .first();

      results.push({
        ...resolveDates(updated),
        deleted: Boolean(updated.deleted),
      });
    }

    return results;
  }

  async pullCheckpoints({ limit, minUpdatedAt, userId }) {
    const minDate = new Date(minUpdatedAt).getTime();
    const checkpoints = await this.knex
      .select(
        "checkpoints.id",
        "checkpoints.event_id",
        "checkpoints.cp_id",
        "checkpoints.cp_code",
        "checkpoints.skipped",
        "checkpoints.skip_reason",
        "checkpoints.created_at",
        "checkpoints.updated_at",
        "checkpoints.deleted",
        "checkpoints._modified",
      )
      .from("checkpoints")
      .join("events", "checkpoints.event_id", "=", "events.id")
      .join("participants", "events.id", "=", "participants.event_id")
      .where("participants.user_id", userId)
      .andWhere("checkpoints._modified", ">=", minDate)
      .orderBy("checkpoints._modified", "asc")
      .limit(limit);

    return checkpoints.map((checkpoint) => ({
      ...resolveDates(checkpoint),
      skipped: Boolean(checkpoint.skipped),
      deleted: Boolean(checkpoint.deleted),
    }));
  }

  async getCheckpointsCheckpoint() {
    const result = await this.knex
      .select("_modified")
      .from("checkpoints")
      .orderBy("_modified", "desc")
      .limit(1);

    return {
      lastModified: result.length > 0 ? result[0]._modified : 0,
    };
  }

  async pushCheckpoints(checkpoints, userId) {
    const results = [];

    for (const checkpoint of checkpoints) {
      // Verify user is a participant in the event
      const participant = await this.knex
        .select("id")
        .from("participants")
        .where({ user_id: userId, event_id: checkpoint.event_id })
        .first();

      if (!participant) {
        // Skip checkpoints where user is not a participant in the event
        continue;
      }

      // Check if checkpoint exists
      const existing = await this.knex
        .select("id")
        .from("checkpoints")
        .where({ id: checkpoint.id })
        .first();

      const checkpointData = {
        event_id: checkpoint.event_id,
        cp_id: checkpoint.cp_id,
        cp_code: checkpoint.cp_code,
        skipped: checkpoint.skipped ? 1 : 0,
        skip_reason: checkpoint.skip_reason,
        created_at: new Date(checkpoint.created_at).toISOString(),
        updated_at: new Date(checkpoint.updated_at).toISOString(),
        deleted: checkpoint.deleted ? 1 : 0,
      };

      let actualId = checkpoint.id;

      if (existing) {
        // Update existing checkpoint
        await this.knex("checkpoints")
          .where({ id: checkpoint.id })
          .update(checkpointData);
      } else {
        // Insert new checkpoint (handle temporary IDs)
        if (checkpoint.id < 0) {
          // Generate new ID for temporary IDs
          const [newId] = await this.knex("checkpoints").insert(checkpointData);
          actualId = newId;
        } else {
          await this.knex("checkpoints").insert({
            id: checkpoint.id,
            ...checkpointData,
          });
        }
      }

      // Fetch the updated/created checkpoint
      const updated = await this.knex
        .select(
          "id",
          "event_id",
          "cp_id",
          "cp_code",
          "skipped",
          "skip_reason",
          "created_at",
          "updated_at",
          "deleted",
          "_modified",
        )
        .from("checkpoints")
        .where({ id: actualId })
        .first();

      results.push({
        ...resolveDates(updated),
        skipped: Boolean(updated.skipped),
        deleted: Boolean(updated.deleted),
      });
    }

    return results;
  }

  async pullVirtualChallenges({ limit, minUpdatedAt }) {
    const minDate = new Date(minUpdatedAt).getTime();
    const challenges = await this.knex
      .select(
        "id",
        "name",
        "checkpoints",
        "created_at",
        "updated_at",
        "deleted",
        "_modified",
      )
      .from("virtual_challenges")
      .where("_modified", ">=", minDate)
      .orderBy("_modified", "asc")
      .limit(limit);

    return challenges.map((challenge) => ({
      ...resolveDates(challenge),
      deleted: Boolean(challenge.deleted),
    }));
  }

  async getVirtualChallengesCheckpoint() {
    const result = await this.knex
      .select("_modified")
      .from("virtual_challenges")
      .orderBy("_modified", "desc")
      .limit(1);

    return {
      lastModified: result.length > 0 ? result[0]._modified : 0,
    };
  }

  async pushVirtualChallenges(challenges) {
    const results = [];

    for (const challenge of challenges) {
      // Check if challenge exists
      const existing = await this.knex
        .select("id")
        .from("virtual_challenges")
        .where({ id: challenge.id })
        .first();

      const challengeData = {
        name: challenge.name,
        checkpoints: challenge.checkpoints,
        created_at: challenge.created_at,
        updated_at: challenge.updated_at,
        deleted: challenge.deleted ? 1 : 0,
      };

      let actualId = challenge.id;

      if (existing) {
        // Update existing challenge
        await this.knex("virtual_challenges")
          .where({ id: challenge.id })
          .update(challengeData);
      } else {
        // Insert new challenge (handle temporary IDs)
        if (challenge.id < 0) {
          // Generate new ID for temporary IDs
          const [newId] =
            await this.knex("virtual_challenges").insert(challengeData);
          actualId = newId;
        } else {
          await this.knex("virtual_challenges").insert({
            id: challenge.id,
            ...challengeData,
          });
        }
      }

      // Fetch the updated/created challenge
      const updated = await this.knex
        .select(
          "id",
          "name",
          "checkpoints",
          "created_at",
          "updated_at",
          "deleted",
          "_modified",
        )
        .from("virtual_challenges")
        .where({ id: actualId })
        .first();

      results.push({
        ...resolveDates(updated),
        deleted: Boolean(updated.deleted),
      });
    }

    return results;
  }

  async pullParticipants({ limit, minUpdatedAt, userId }) {
    const minDate = new Date(minUpdatedAt).getTime();

    const query = knex
      .select(
        "participants.id",
        "participants.user_id",
        "participants.event_id",
        "participants.created_at",
        "participants.updated_at",
        "participants.deleted",
        "participants._modified",
      )
      .from("participants")
      .join("events", "participants.event_id", "=", "events.id")
      .join(
        "participants as user_participants",
        "events.id",
        "=",
        "user_participants.event_id"
      )
      .where("user_participants.user_id", userId)
      .andWhere("participants._modified", ">", minDate)
      .orderBy("participants._modified", "asc")
      .limit(limit);

    const participants = await query;

    return participants.map((participant) => ({
      ...resolveDates(participant),
      deleted: Boolean(participant.deleted),
    }));
  }

  async pushParticipants(participants) {
    const results = [];

    for (const participant of participants) {
      // Check if participant exists
      const existing = await knex
        .select("id")
        .from("participants")
        .where({ id: participant.id })
        .first();

      const participantData = {
        user_id: participant.user_id,
        event_id: participant.event_id,
        created_at: new Date(participant.created_at).toISOString(),
        updated_at: new Date(participant.updated_at).toISOString(),
        deleted: participant.deleted ? 1 : 0,
      };

      let actualId = participant.id;

      if (existing) {
        // Update existing participant
        await knex("participants")
          .where({ id: participant.id })
          .update(participantData);
      } else {
        // Insert new participant (handle temporary IDs)
        if (participant.id < 0) {
          // Generate new ID for temporary IDs
          const [newId] = await knex("participants").insert(participantData);
          actualId = newId;
        } else {
          await knex("participants").insert({
            id: participant.id,
            ...participantData,
          });
        }
      }

      // Fetch the updated/created participant
      const updated = await knex
        .select(
          "id",
          "user_id",
          "event_id",
          "created_at",
          "updated_at",
          "deleted",
          "_modified",
        )
        .from("participants")
        .where({ id: actualId })
        .first();

      results.push({
        ...resolveDates(updated),
        deleted: Boolean(updated.deleted),
      });
    }

    return results;
  }
}

module.exports = Database;
