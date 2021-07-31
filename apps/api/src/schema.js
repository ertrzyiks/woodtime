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
    virtual_challenge: EventVirtualChallenge
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
    totalCount: Int!
  }

  input CoordinatesInput {
    lat: String
    lng: String
  }
  
  input PointsNearbyInput {
    start: CoordinatesInput!
    radius: Int!
    count: Int!
  }
  
  type EventVirtualChallenge {
    id: Int!
  }

  type VirtualChallenge {
    id: Int!
    name: String!
    checkpoints: CoordinatesConnection!
    radius: Int!
    created_at: String!
    updated_at: String!
  }
  
  type VirtualChallengeConnection {
    totalCount: Int!
    nodes: [VirtualChallenge]
  }

  type Query {
    me: User
    events: [Event!]!
    event(id: Int!): Event
    pointsNearby(input: PointsNearbyInput!): CoordinatesConnection!
    virtualChallenges: VirtualChallengeConnection!
    virtualChallenge(id: Int!): VirtualChallenge
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
    success: Boolean!
    checkpoint: Checkpoint
  }

  type DeleteCheckpointResult {
    success: Boolean!
    id: Int!
  }
  
  input CreateVirtualChallengeInput {
    name: String!
    checkpoints: [CoordinatesInput]
  }
  
  type CreateVirtualChallengeResult {
    success: Boolean!
    virtualChallenge: VirtualChallenge
  }

  type EnrollVirtualChallengeResult {
    success: Boolean!
    event: Event
  }
  
  type CheckInViertualCheckpointResult {
    success: Boolean!
    checkpoint: Checkpoint
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
    ): CreateCheckpointResult!
    
    checkInVirtualCheckpoint(
      event_id: Int!
      position: CoordinatesInput!
    ): CheckInViertualCheckpointResult!

    deleteCheckpoint(id: Int!): DeleteCheckpointResult!
    
    createVirtualChallenge(input: CreateVirtualChallengeInput!): CreateVirtualChallengeResult!
    enrollVirtualChallenge(id: Int!): EnrollVirtualChallengeResult!
  }
`;
