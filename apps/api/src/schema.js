const { gql } = require("apollo-server-express");

module.exports = gql`
  type Checkpoint {
    id: Int
    event_id: Int!
    cp_id: Int!
    cp_code: String
    skipped: Boolean
    skip_reason: String
    created_at: String!
    updated_at: String!
  }

  type Event {
    id: Int!
    name: String!
    type: Int!
    checkpoint_count: Int!
    checkpoints: [Checkpoint!]!
    created_at: String!
    updated_at: String!
  }

  type User {
    id: String!
    name: String!
  }
  
  type Coordinates {
    lat: String
    lng: String
  }

  type CoordinatesConnection {
    points: [Coordinates]!
  }

  input CoordinatesInput {
    lat: String
    lng: String
  }
  
  input VirtualCheckpontsInput {
    start: CoordinatesInput!
    radius: Int!
    count: Int!
  }

  type Query {
    me: User
    events: [Event!]!
    event(id: Int!): Event
    virtualCheckpoints(input: VirtualCheckpontsInput!): CoordinatesConnection!
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

    createEvent(
      name: String!
      checkpointCount: Int!
      type: Int!
    ): CreateEventResult

    deleteEvent(id: Int!): DeleteEventResult

    createCheckpoint(
      event_id: Int!
      cp_id: Int!
      cp_code: String
      skipped: Boolean
      skip_reason: String
    ): CreateCheckpointResult

    deleteCheckpoint(id: Int!): DeleteCheckpointResult
  }
`;
