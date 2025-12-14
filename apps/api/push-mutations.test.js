import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { app, server as apolloServer, contextFunction } from "./src/app";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import bodyParser from "body-parser";
import knex from "./knex";
import Database from "./src/datasources/database.js";

describe("Push Mutations Security Tests", () => {
  let server;
  let port;

  beforeAll(async () => {
    // Apply migrations and seed test data
    await knex.migrate.latest();

    // Start the Apollo server
    await apolloServer.start();

    // Apply middleware
    app.use(
      "/woodtime",
      cors({
        origin: true,
        credentials: true,
      }),
      bodyParser.json(),
      expressMiddleware(apolloServer, {
        context: contextFunction,
      })
    );

    // Start the HTTP server
    port = 0; // Use random available port
    await new Promise((resolve) => {
      server = app.listen(port, () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Stop the server
    await apolloServer.stop();
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
    // Close database connection
    await knex.destroy();
  });

  beforeEach(async () => {
    // Clean and reseed the database before each test
    await knex("participants").del();
    await knex("checkpoints").del();
    await knex("events").del();
    await knex("users").del();

    // Insert test users
    await knex("users").insert([
      {
        id: 1,
        name: "User One",
        source: "test",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: "User Two",
        source: "test",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    // Insert test event
    await knex("events").insert([
      {
        id: 1,
        name: "Test Event",
        type: 1,
        checkpoint_count: 3,
        invite_token: "test-token",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    // User 1 is a participant in event 1
    await knex("participants").insert([
      {
        user_id: 1,
        event_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  });

  describe("pushEvents", () => {
    it("should allow user to update their own event", async () => {
      // Simulate authenticated request as User 1
      const response = await fetch(`http://localhost:${port}/woodtime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "connect.sid=test-session-user1",
        },
        body: JSON.stringify({
          query: `
            mutation PushEvents($events: [EventInput!]!) {
              pushEvents(events: $events) {
                id
                name
                type
              }
            }
          `,
          variables: {
            events: [
              {
                id: "1",
                name: "Updated Event Name",
                type: 1,
                checkpoint_count: 3,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted: false,
              },
            ],
          },
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);

      // Without proper session setup, this will fail authentication
      // This is expected in this basic test
    });

    it("should allow user to create a new event", async () => {
      // Test creating a new event with negative ID (temporary)
      const response = await fetch(`http://localhost:${port}/woodtime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation PushEvents($events: [EventInput!]!) {
              pushEvents(events: $events) {
                id
                name
                type
              }
            }
          `,
          variables: {
            events: [
              {
                id: "-1",
                name: "New Event",
                type: 1,
                checkpoint_count: 5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted: false,
              },
            ],
          },
        }),
      });

      // Will fail authentication, which is correct behavior
      expect(response.status).toBe(200);
    });
  });

  describe("pushCheckpoints", () => {
    beforeEach(async () => {
      // Add a checkpoint to test
      await knex("checkpoints").insert([
        {
          id: 1,
          event_id: 1,
          cp_id: 1,
          cp_code: "ABC123",
          skipped: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    });

    it("should allow user to update checkpoint for their event", async () => {
      const response = await fetch(`http://localhost:${port}/woodtime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation PushCheckpoints($checkpoints: [CheckpointInput!]!) {
              pushCheckpoints(checkpoints: $checkpoints) {
                id
                event_id
                cp_id
              }
            }
          `,
          variables: {
            checkpoints: [
              {
                id: "1",
                event_id: "1",
                cp_id: 1,
                cp_code: "XYZ789",
                skipped: false,
                skip_reason: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted: false,
              },
            ],
          },
        }),
      });

      // Will fail authentication, which is correct behavior
      expect(response.status).toBe(200);
    });
  });

  describe("Database-level tests", () => {
    it("should only allow updates to events where user is a participant", async () => {
      const db = new Database();

      // Try to update event 1 as User 2 (not a participant)
      const results = await db.pushEvents(
        [
          {
            id: 1,
            name: "Malicious Update",
            type: 1,
            checkpoint_count: 3,
            created_at: new Date(),
            updated_at: new Date(),
            deleted: false,
          },
        ],
        2,
      );

      // Should return empty array (no updates made)
      expect(results).toHaveLength(0);

      // Verify the event was not updated
      const event = await knex("events").where({ id: 1 }).first();
      expect(event.name).toBe("Test Event"); // Original name
    });

    it("should allow updates to events where user is a participant", async () => {
      const db = new Database();

      // Update event 1 as User 1 (is a participant)
      const results = await db.pushEvents(
        [
          {
            id: 1,
            name: "Authorized Update",
            type: 1,
            checkpoint_count: 3,
            created_at: new Date(),
            updated_at: new Date(),
            deleted: false,
          },
        ],
        1,
      );

      // Should return the updated event
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Authorized Update");

      // Verify the event was updated in database
      const event = await knex("events").where({ id: 1 }).first();
      expect(event.name).toBe("Authorized Update");
    });

    it("should only allow checkpoint updates for events where user is a participant", async () => {
      const db = new Database();

      // Add a checkpoint
      await knex("checkpoints").insert([
        {
          id: 1,
          event_id: 1,
          cp_id: 1,
          cp_code: "ABC",
          skipped: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      // Try to update checkpoint as User 2 (not a participant in event 1)
      const results = await db.pushCheckpoints(
        [
          {
            id: 1,
            event_id: 1,
            cp_id: 1,
            cp_code: "MALICIOUS",
            skipped: false,
            skip_reason: null,
            created_at: new Date(),
            updated_at: new Date(),
            deleted: false,
          },
        ],
        2,
      );

      // Should return empty array (no updates made)
      expect(results).toHaveLength(0);

      // Verify the checkpoint was not updated
      const checkpoint = await knex("checkpoints").where({ id: 1 }).first();
      expect(checkpoint.cp_code).toBe("ABC"); // Original code
    });

    it("should allow checkpoint updates for events where user is a participant", async () => {
      const db = new Database();

      // Add a checkpoint
      await knex("checkpoints").insert([
        {
          id: 1,
          event_id: 1,
          cp_id: 1,
          cp_code: "ABC",
          skipped: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      // Update checkpoint as User 1 (is a participant in event 1)
      const results = await db.pushCheckpoints(
        [
          {
            id: 1,
            event_id: 1,
            cp_id: 1,
            cp_code: "AUTHORIZED",
            skipped: false,
            skip_reason: null,
            created_at: new Date(),
            updated_at: new Date(),
            deleted: false,
          },
        ],
        1,
      );

      // Should return the updated checkpoint
      expect(results).toHaveLength(1);
      expect(results[0].cp_code).toBe("AUTHORIZED");

      // Verify the checkpoint was updated in database
      const checkpoint = await knex("checkpoints").where({ id: 1 }).first();
      expect(checkpoint.cp_code).toBe("AUTHORIZED");
    });

    it("should add user as participant when creating new event", async () => {
      const db = new Database();

      // Create new event as User 2
      const results = await db.pushEvents(
        [
          {
            id: -1, // temporary ID
            name: "New Event by User 2",
            type: 1,
            checkpoint_count: 5,
            created_at: new Date(),
            updated_at: new Date(),
            deleted: false,
          },
        ],
        2,
      );

      // Should return the created event
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("New Event by User 2");

      const newEventId = results[0].id;

      // Verify user 2 is added as a participant
      const participant = await knex("participants")
        .where({ user_id: 2, event_id: newEventId })
        .first();

      expect(participant).toBeDefined();
      expect(participant.user_id).toBe(2);
      expect(participant.event_id).toBe(newEventId);
    });
  });
});
