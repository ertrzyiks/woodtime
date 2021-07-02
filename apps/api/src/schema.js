const { gql } = require("apollo-server-express");

module.exports = gql`
  type Checkpoint {
    id: Int!
    cp_id: Int!
    cp_code: String
    skipped: Boolean
    skip_reason: String
    createdAt: String!
    updatedAt: String!
  }

  type Event {
    id: Int!
    name: String!
    checkpoint_count: [Checkpoint!]!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    id: String!
    name: String!
  }

  type Query {
    me: User
    events: [Event!]!
  }

  type CreateUserPayload {
    success: Boolean!
    user: User
    accessToken: String
    refreshToken: String
  }

  type LoginPayload {
    success: Boolean!
    user: User
    accessToken: String
    refreshToken: String
  }

  type JoinEventPayload {
    success: Boolean!
    event: Event
  }

  type CreateEventResult {
    success: Boolean!
    event: Event!
  }

  type DeleteEventResult {
    success: Boolean!
    id: Int!
  }

  type CreateCheckpointResult {
    checkpoint: Checkpoint
  }

  type DeleteCheckpointResult {
    success: Boolean!
    id: Int!
  }

  type Mutation {
    createUser(name: String!): CreateUserPayload
    login(token: String!): LoginPayload
    joinEvent(id: String!): JoinEventPayload

    createEvent(name: String!, checkpoint_count: Int!): CreateEventResult

    deleteEvent(id: Int!): DeleteEventResult

    createCheckpoint(
      event_id: Int!
      cp_id: Int!
      cp_code: String
    ): CreateCheckpointResult

    deleteCheckpoint(id: Int!): DeleteCheckpointResult
  }
`;
