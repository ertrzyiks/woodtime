import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createRequire } from "module";
import knexLib from "knex";

const require = createRequire(import.meta.url);

// Shared test database setup
let db;
let testKnex;
let Database;
let originalKnex;

beforeAll(async () => {
  // Create an in-memory SQLite database for testing
  testKnex = knexLib({
    client: "sqlite3",
    connection: ":memory:",
    useNullAsDefault: true,
  });

  // Create tables
  await testKnex.schema.createTable("users", (table) => {
    table.integer("id").primary();
    table.string("name").notNullable();
    table.string("created_at").notNullable();
    table.string("updated_at").notNullable();
  });

  await testKnex.schema.createTable("events", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.integer("type").notNullable();
    table.string("invite_token");
    table.integer("checkpoint_count").notNullable();
    table.integer("virtual_challenge_id");
    table.string("created_at").notNullable();
    table.string("updated_at").notNullable();
    table.integer("deleted").defaultTo(0);
    table.integer("_modified").defaultTo(0);
  });

  await testKnex.schema.createTable("participants", (table) => {
    table.increments("id").primary();
    table.integer("user_id");
    table.integer("event_id");
    table.string("created_at").notNullable();
    table.string("updated_at").notNullable();
    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table.foreign("event_id").references("events.id").onDelete("CASCADE");
  });

  await testKnex.schema.createTable("checkpoints", (table) => {
    table.increments("id").primary();
    table.integer("cp_id").notNullable();
    table.string("cp_code");
    table.integer("event_id");
    table.boolean("skipped");
    table.string("skip_reason");
    table.string("created_at").notNullable();
    table.string("updated_at").notNullable();
    table.integer("deleted").defaultTo(0);
    table.integer("_modified").defaultTo(0);
    table.foreign("event_id").references("events.id").onDelete("CASCADE");
  });

  await testKnex.schema.createTable("virtual_challenges", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.text("checkpoints");
    table.string("created_at").notNullable();
    table.string("updated_at").notNullable();
    table.integer("deleted").defaultTo(0);
    table.integer("_modified").defaultTo(0);
  });

  // Mock the knex module to use our test instance
  originalKnex = require.cache[require.resolve("../../knex")];
  require.cache[require.resolve("../../knex")] = {
    exports: testKnex,
  };

  // Import Database after mocking knex
  Database = require("./database");
  db = new Database();
});

beforeEach(async () => {
  // Clean up tables before each test
  await testKnex("checkpoints").del();
  await testKnex("participants").del();
  await testKnex("events").del();
  await testKnex("users").del();
  await testKnex("virtual_challenges").del();
});

afterAll(async () => {
  // Restore original knex
  if (originalKnex) {
    require.cache[require.resolve("../../knex")] = originalKnex;
  }

  await testKnex.destroy();
});

describe("Database", () => {
  describe("findUserById", () => {
    it("should find user by id", async () => {
      await testKnex("users").insert({
        id: 1,
        name: "Test User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await db.findUserById(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe("Test User");
    });
  });

  describe("findEventsForUser", () => {
    it("should find events for user", async () => {
      await testKnex("users").insert({
        id: 1,
        name: "Test User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("events").insert({
        id: 1,
        name: "Test Event",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("participants").insert({
        user_id: 1,
        event_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await db.findEventsForUser({ id: 1 });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Test Event");
      expect(result[0].created_at).toBeInstanceOf(Date);
    });
  });

  describe("findEventById", () => {
    it("should find event by id", async () => {
      await testKnex("events").insert({
        id: 1,
        name: "Test Event",
        type: 1,
        invite_token: "test-token",
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await db.findEventById(1);
      expect(result).toBeDefined();
      expect(result.name).toBe("Test Event");
      expect(result.invite_token).toBe("test-token");
      expect(result.created_at).toBeInstanceOf(Date);
    });
  });

  describe("deleteEventById", () => {
    it("should delete event by id", async () => {
      await testKnex("events").insert({
        id: 1,
        name: "Test Event",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await db.deleteEventById(1);
      const result = await testKnex("events").where({ id: 1 });
      expect(result).toHaveLength(0);
    });
  });

  describe("createEvent", () => {
    it("should create a new event", async () => {
      const result = await db.createEvent({
        id: "1",
        name: "New Event",
        type: 1,
        checkpointCount: 5,
      });
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe("New Event");
      expect(result.invite_token).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
    });
  });

  describe("findParticipant", () => {
    it("should find participant", async () => {
      await testKnex("users").insert({
        id: 1,
        name: "Test User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("events").insert({
        id: 1,
        name: "Test Event",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("participants").insert({
        user_id: 1,
        event_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await db.findParticipant({ userId: 1, eventId: 1 });
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });

  describe("findParticipantsForEvent", () => {
    it("should find all participants for event", async () => {
      await testKnex("users").insert([
        {
          id: 1,
          name: "Test User 1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Test User 2",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      await testKnex("events").insert({
        id: 1,
        name: "Test Event",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("participants").insert([
        {
          user_id: 1,
          event_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          user_id: 2,
          event_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const result = await db.findParticipantsForEvent(1);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBeDefined();
    });
  });

  describe("createParticipant", () => {
    it("should create a new participant", async () => {
      await testKnex("users").insert({
        id: 1,
        name: "Test User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("events").insert({
        id: 1,
        name: "Test Event",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await db.createParticipant({ userId: 1, eventId: 1 });
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.user_id).toBe(1);
      expect(result.event_id).toBe(1);
    });
  });

  describe("createCheckpoint", () => {
    it("should create a new checkpoint", async () => {
      await testKnex("events").insert({
        id: 1,
        name: "Test Event",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await db.createCheckpoint({
        eventId: 1,
        cpId: 1,
        cpCode: "CP1",
        skipped: false,
      });
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.cp_id).toBe(1);
      expect(result.created_at).toBeInstanceOf(Date);
    });
  });

  describe("deleteCheckpoint", () => {
    it("should delete checkpoint by id", async () => {
      await testKnex("events").insert({
        id: 1,
        name: "Test Event",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("checkpoints").insert({
        id: 1,
        event_id: 1,
        cp_id: 1,
        cp_code: "CP1",
        skipped: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await db.deleteCheckpoint(1);
      const result = await testKnex("checkpoints").where({ id: 1 });
      expect(result).toHaveLength(0);
    });
  });

  describe("findCheckpointById", () => {
    it("should find checkpoint by id", async () => {
      await testKnex("events").insert({
        id: 1,
        name: "Test Event",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("checkpoints").insert({
        id: 1,
        event_id: 1,
        cp_id: 1,
        cp_code: "CP1",
        skipped: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await db.findCheckpointById(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.event_id).toBe(1);
    });
  });

  describe("findCheckpointsForEvent", () => {
    it("should find all checkpoints for event", async () => {
      await testKnex("events").insert({
        id: 1,
        name: "Test Event",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("checkpoints").insert([
        {
          event_id: 1,
          cp_id: 1,
          cp_code: "CP1",
          skipped: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          event_id: 1,
          cp_id: 2,
          cp_code: "CP2",
          skipped: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const result = await db.findCheckpointsForEvent(1);
      expect(result).toHaveLength(2);
      expect(result[0].cp_code).toBe("CP1");
      expect(result[0].created_at).toBeInstanceOf(Date);
    });
  });

  describe("findFriendForUser", () => {
    it("should find friends for user", async () => {
      await testKnex("users").insert([
        {
          id: 1,
          name: "User 1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "User 2",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      await testKnex("events").insert({
        id: 1,
        name: "Test Event",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("participants").insert([
        {
          user_id: 1,
          event_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          user_id: 2,
          event_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const result = await db.findFriendForUser({ id: 1 });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
      expect(result[0].name).toBe("User 2");
    });
  });

  describe("isFriendForUser", () => {
    it("should return true if users share an event", async () => {
      await testKnex("users").insert([
        {
          id: 1,
          name: "User 1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "User 2",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      await testKnex("events").insert({
        id: 1,
        name: "Test Event",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("participants").insert([
        {
          user_id: 1,
          event_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          user_id: 2,
          event_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const result = await db.isFriendForUser({ id: 1, friendId: 2 });
      expect(result).toBe(true);
    });
  });

  describe("pullEvents", () => {
    it("should pull events for user", async () => {
      await testKnex("users").insert({
        id: 1,
        name: "Test User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const now = Date.now();
      await testKnex("events").insert({
        id: 1,
        name: "Test Event",
        type: 1,
        checkpoint_count: 5,
        invite_token: "test-token",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _modified: now,
      });

      await testKnex("participants").insert({
        user_id: 1,
        event_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await db.pullEvents({
        userId: 1,
        limit: 10,
        minUpdatedAt: new Date(0),
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Test Event");
      expect(result[0].deleted).toBe(false);
    });
  });

  describe("pushEvents", () => {
    it("should push new events", async () => {
      await testKnex("users").insert({
        id: "1",
        name: "Test User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const events = [
        {
          id: "1",
          name: "New Event",
          type: 1,
          checkpoint_count: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted: false,
        },
      ];
      const result = await db.pushEvents(events, "user-1");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("New Event");
      expect(result[0].id).toBeGreaterThan(0);
    });
  });

  describe("pushCheckpoints", () => {
    it("should push new checkpoints", async () => {
      await testKnex("events").insert({
        id: "1",
        name: "Test Event",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("participants").insert({
        id: "1",
        user_id: "user-1",
        event_id: "1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const checkpoints = [
        {
          id: "1",
          event_id: "1",
          cp_id: 1,
          cp_code: "CP1",
          skipped: false,
          skip_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted: false,
        },
      ];
      const result = await db.pushCheckpoints(checkpoints, "user-1");
      expect(result).toHaveLength(1);
      expect(result[0].cp_code).toBe("CP1");
      expect(result[0].id).toBeGreaterThan(0);
    });
  });

  describe("pullVirtualChallenges", () => {
    it("should pull virtual challenges", async () => {
      const now = Date.now();
      await testKnex("virtual_challenges").insert({
        id: 1,
        name: "Test Challenge",
        checkpoints: JSON.stringify([1, 2, 3]),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _modified: now,
      });

      const result = await db.pullVirtualChallenges({
        limit: 10,
        minUpdatedAt: new Date(0),
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Test Challenge");
      expect(result[0].deleted).toBe(false);
    });
  });

  describe("getVirtualChallengesCheckpoint", () => {
    it("should get last modified timestamp", async () => {
      const result = await db.getVirtualChallengesCheckpoint();
      expect(result).toBeDefined();
      expect(result.lastModified).toBe(0);
    });
  });

  describe("pushVirtualChallenges", () => {
    it("should push new virtual challenges", async () => {
      const challenges = [
        {
          id: -1,
          name: "New Challenge",
          checkpoints: JSON.stringify([1, 2, 3]),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted: false,
        },
      ];
      const result = await db.pushVirtualChallenges(challenges);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("New Challenge");
      expect(result[0].id).toBeGreaterThan(0);
    });
  });

  describe("getCheckpointsCheckpoint", () => {
    it("should get last modified timestamp", async () => {
      const result = await db.getCheckpointsCheckpoint();
      expect(result).toBeDefined();
      expect(result.lastModified).toBe(0);
    });
  });

  describe("pullCheckpoints", () => {
    it("should return only checkpoints for events the user participates in", async () => {
      const now = Date.now();

      // Insert test users
      await testKnex("users").insert([
        {
          id: 1,
          name: "User One",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "User Two",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      // Insert test events
      await testKnex("events").insert([
        {
          id: 1,
          name: "Event One",
          type: 1,
          checkpoint_count: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _modified: now,
        },
        {
          id: 2,
          name: "Event Two",
          type: 1,
          checkpoint_count: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _modified: now,
        },
      ]);

      // User 1 participates in Event 1, User 2 participates in Event 2
      await testKnex("participants").insert([
        {
          user_id: 1,
          event_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          user_id: 2,
          event_id: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      // Insert checkpoints for both events
      await testKnex("checkpoints").insert([
        {
          event_id: 1,
          cp_id: 1,
          cp_code: "CP1-E1",
          skipped: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _modified: now,
        },
        {
          event_id: 1,
          cp_id: 2,
          cp_code: "CP2-E1",
          skipped: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _modified: now + 1000,
        },
        {
          event_id: 2,
          cp_id: 1,
          cp_code: "CP1-E2",
          skipped: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _modified: now + 2000,
        },
      ]);

      // User 1 should only see checkpoints from Event 1
      const result = await db.pullCheckpoints({
        userId: 1,
        limit: 10,
        minUpdatedAt: new Date(now - 1000),
      });

      expect(result).toHaveLength(2);
      expect(result[0].cp_code).toBe("CP1-E1");
      expect(result[0].event_id).toBe(1);
      expect(result[1].cp_code).toBe("CP2-E1");
      expect(result[1].event_id).toBe(1);
    });

    it("should respect the limit parameter", async () => {
      const now = Date.now();

      // Insert test data
      await testKnex("users").insert({
        id: 1,
        name: "User One",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("events").insert({
        id: 1,
        name: "Event One",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _modified: now,
      });

      await testKnex("participants").insert({
        user_id: 1,
        event_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Insert 5 checkpoints
      for (let i = 1; i <= 5; i++) {
        await testKnex("checkpoints").insert({
          event_id: 1,
          cp_id: i,
          cp_code: `CP${i}`,
          skipped: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _modified: now + i * 1000,
        });
      }

      // Request only 3 checkpoints
      const result = await db.pullCheckpoints({
        userId: 1,
        limit: 3,
        minUpdatedAt: new Date(now - 1000),
      });

      expect(result).toHaveLength(3);
      expect(result[0].cp_code).toBe("CP1");
      expect(result[1].cp_code).toBe("CP2");
      expect(result[2].cp_code).toBe("CP3");
    });

    it("should filter by minUpdatedAt timestamp", async () => {
      const now = Date.now();
      const cutoffTime = now + 2500;

      // Insert test data
      await testKnex("users").insert({
        id: 1,
        name: "User One",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("events").insert({
        id: 1,
        name: "Event One",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _modified: now,
      });

      await testKnex("participants").insert({
        user_id: 1,
        event_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Insert checkpoints with different timestamps
      await testKnex("checkpoints").insert([
        {
          event_id: 1,
          cp_id: 1,
          cp_code: "CP1",
          skipped: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _modified: now + 1000,
        },
        {
          event_id: 1,
          cp_id: 2,
          cp_code: "CP2",
          skipped: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _modified: now + 2000,
        },
        {
          event_id: 1,
          cp_id: 3,
          cp_code: "CP3",
          skipped: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _modified: now + 3000,
        },
      ]);

      // Request only checkpoints after cutoff time
      const result = await db.pullCheckpoints({
        userId: 1,
        limit: 10,
        minUpdatedAt: new Date(cutoffTime),
      });

      // Should only get CP3 which has _modified > cutoffTime
      expect(result).toHaveLength(1);
      expect(result[0].cp_code).toBe("CP3");
    });

    it("should return empty array when user has no events", async () => {
      const now = Date.now();

      // Insert test user without any events
      await testKnex("users").insert({
        id: 1,
        name: "User One",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await db.pullCheckpoints({
        userId: 1,
        limit: 10,
        minUpdatedAt: new Date(now - 1000),
      });

      expect(result).toHaveLength(0);
    });

    it("should convert skipped and deleted to boolean values", async () => {
      const now = Date.now();

      // Insert test data
      await testKnex("users").insert({
        id: 1,
        name: "User One",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("events").insert({
        id: 1,
        name: "Event One",
        type: 1,
        checkpoint_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _modified: now,
      });

      await testKnex("participants").insert({
        user_id: 1,
        event_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await testKnex("checkpoints").insert([
        {
          event_id: 1,
          cp_id: 1,
          cp_code: "CP1",
          skipped: 1,
          skip_reason: "Test reason",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted: 1,
          _modified: now,
        },
        {
          event_id: 1,
          cp_id: 2,
          cp_code: "CP2",
          skipped: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted: 0,
          _modified: now + 1000,
        },
      ]);

      const result = await db.pullCheckpoints({
        userId: 1,
        limit: 10,
        minUpdatedAt: new Date(now - 1000),
      });

      expect(result).toHaveLength(2);
      expect(result[0].skipped).toBe(true);
      expect(result[0].deleted).toBe(true);
      expect(result[1].skipped).toBe(false);
      expect(result[1].deleted).toBe(false);
    });
  });
});
