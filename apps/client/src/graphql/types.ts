export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: any; output: any };
};

export type CheckInViertualCheckpointResult = {
  __typename?: 'CheckInViertualCheckpointResult';
  checkpoint?: Maybe<Checkpoint>;
  success: Scalars['Boolean']['output'];
};

export type Checkpoint = {
  __typename?: 'Checkpoint';
  cp_code?: Maybe<Scalars['String']['output']>;
  cp_id: Scalars['Int']['output'];
  created_at: Scalars['DateTime']['output'];
  event_id: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  skip_reason?: Maybe<Scalars['String']['output']>;
  skipped: Scalars['Boolean']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type CheckpointDocument = {
  __typename?: 'CheckpointDocument';
  cp_code?: Maybe<Scalars['String']['output']>;
  cp_id: Scalars['Int']['output'];
  created_at: Scalars['DateTime']['output'];
  deleted: Scalars['Boolean']['output'];
  event_id: Scalars['String']['output'];
  id: Scalars['String']['output'];
  skip_reason?: Maybe<Scalars['String']['output']>;
  skipped: Scalars['Boolean']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type CheckpointInput = {
  cp_code?: InputMaybe<Scalars['String']['input']>;
  cp_id: Scalars['Int']['input'];
  created_at: Scalars['DateTime']['input'];
  deleted: Scalars['Boolean']['input'];
  event_id: Scalars['String']['input'];
  id: Scalars['String']['input'];
  skip_reason?: InputMaybe<Scalars['String']['input']>;
  skipped: Scalars['Boolean']['input'];
  updated_at: Scalars['DateTime']['input'];
};

export type Coordinates = {
  __typename?: 'Coordinates';
  lat: Scalars['String']['output'];
  lng: Scalars['String']['output'];
};

export type CoordinatesConnection = {
  __typename?: 'CoordinatesConnection';
  points: Array<Coordinates>;
  totalCount: Scalars['Int']['output'];
};

export type CoordinatesInput = {
  lat: Scalars['String']['input'];
  lng: Scalars['String']['input'];
};

export type CreateCheckpointResult = {
  __typename?: 'CreateCheckpointResult';
  checkpoint?: Maybe<Checkpoint>;
  success: Scalars['Boolean']['output'];
};

export type CreateEventResult = {
  __typename?: 'CreateEventResult';
  event: Event;
  success: Scalars['Boolean']['output'];
};

export type CreateVirtualChallengeInput = {
  checkpoints?: InputMaybe<Array<InputMaybe<CoordinatesInput>>>;
  name: Scalars['String']['input'];
};

export type CreateVirtualChallengeResult = {
  __typename?: 'CreateVirtualChallengeResult';
  success: Scalars['Boolean']['output'];
  virtualChallenge?: Maybe<VirtualChallenge>;
};

export type DeleteCheckpointResult = {
  __typename?: 'DeleteCheckpointResult';
  id: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type EnrollVirtualChallengeResult = {
  __typename?: 'EnrollVirtualChallengeResult';
  event?: Maybe<Event>;
  success: Scalars['Boolean']['output'];
};

export type Event = {
  __typename?: 'Event';
  checkpoint_count: Scalars['Int']['output'];
  checkpoints: Array<Checkpoint>;
  created_at: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  invite_token?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  participants: Array<User>;
  type: Scalars['Int']['output'];
  updated_at: Scalars['DateTime']['output'];
  virtual_challenge?: Maybe<EventVirtualChallenge>;
};

export type EventDocument = {
  __typename?: 'EventDocument';
  checkpoint_count: Scalars['Int']['output'];
  created_at: Scalars['DateTime']['output'];
  deleted: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  invite_token?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: Scalars['Int']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type EventInput = {
  checkpoint_count: Scalars['Int']['input'];
  created_at: Scalars['DateTime']['input'];
  deleted: Scalars['Boolean']['input'];
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  type: Scalars['Int']['input'];
  updated_at: Scalars['DateTime']['input'];
};

export type EventVirtualChallenge = {
  __typename?: 'EventVirtualChallenge';
  id: Scalars['Int']['output'];
};

export type InviteToEventPayload = {
  __typename?: 'InviteToEventPayload';
  event?: Maybe<EventDocument>;
  success: Scalars['Boolean']['output'];
};

export type JoinEventPayload = {
  __typename?: 'JoinEventPayload';
  event?: Maybe<EventDocument>;
  success: Scalars['Boolean']['output'];
};

export type LoginPayload = {
  __typename?: 'LoginPayload';
  accessToken?: Maybe<Scalars['String']['output']>;
  refreshToken?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type Me = {
  __typename?: 'Me';
  friends: Array<User>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  checkInVirtualCheckpoint: CheckInViertualCheckpointResult;
  createCheckpoint: CreateCheckpointResult;
  createEvent?: Maybe<CreateEventResult>;
  createVirtualChallenge: CreateVirtualChallengeResult;
  deleteCheckpoint: DeleteCheckpointResult;
  enrollVirtualChallenge: EnrollVirtualChallengeResult;
  inviteToEvent?: Maybe<InviteToEventPayload>;
  joinEvent?: Maybe<JoinEventPayload>;
  login?: Maybe<LoginPayload>;
  pushCheckpoints: Array<CheckpointDocument>;
  pushEvents: Array<EventDocument>;
  pushParticipants: Array<ParticipantDocument>;
  pushVirtualChallenges: Array<VirtualChallengeDocument>;
  signIn?: Maybe<SignInPayload>;
};

export type MutationCheckInVirtualCheckpointArgs = {
  event_id: Scalars['Int']['input'];
  position: CoordinatesInput;
};

export type MutationCreateCheckpointArgs = {
  cp_code?: InputMaybe<Scalars['String']['input']>;
  cp_id: Scalars['Int']['input'];
  event_id: Scalars['Int']['input'];
  skip_reason?: InputMaybe<Scalars['String']['input']>;
  skipped?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MutationCreateEventArgs = {
  checkpointCount: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  type: Scalars['Int']['input'];
};

export type MutationCreateVirtualChallengeArgs = {
  input: CreateVirtualChallengeInput;
};

export type MutationDeleteCheckpointArgs = {
  id: Scalars['Int']['input'];
};

export type MutationEnrollVirtualChallengeArgs = {
  id: Scalars['Int']['input'];
};

export type MutationInviteToEventArgs = {
  friendId: Scalars['String']['input'];
  id: Scalars['String']['input'];
};

export type MutationJoinEventArgs = {
  id: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type MutationLoginArgs = {
  token: Scalars['String']['input'];
};

export type MutationPushCheckpointsArgs = {
  checkpoints: Array<CheckpointInput>;
};

export type MutationPushEventsArgs = {
  events: Array<EventInput>;
};

export type MutationPushParticipantsArgs = {
  participants: Array<ParticipantInput>;
};

export type MutationPushVirtualChallengesArgs = {
  challenges: Array<VirtualChallengeInput>;
};

export type MutationSignInArgs = {
  name: Scalars['String']['input'];
};

export type ParticipantDocument = {
  __typename?: 'ParticipantDocument';
  created_at: Scalars['DateTime']['output'];
  deleted: Scalars['Boolean']['output'];
  event_id: Scalars['String']['output'];
  id: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
  user_id: Scalars['String']['output'];
};

export type ParticipantInput = {
  created_at: Scalars['DateTime']['input'];
  deleted: Scalars['Boolean']['input'];
  event_id: Scalars['String']['input'];
  id: Scalars['String']['input'];
  updated_at: Scalars['DateTime']['input'];
  user_id: Scalars['String']['input'];
};

export type PointsNearbyInput = {
  count: Scalars['Int']['input'];
  radius: Scalars['Int']['input'];
  start: CoordinatesInput;
};

export type PullCheckpointsResponse = {
  __typename?: 'PullCheckpointsResponse';
  checkpoint: ReplicationCheckpoint;
  documents: Array<CheckpointDocument>;
};

export type PullEventsResponse = {
  __typename?: 'PullEventsResponse';
  checkpoint: ReplicationCheckpoint;
  documents: Array<EventDocument>;
};

export type PullParticipantsResponse = {
  __typename?: 'PullParticipantsResponse';
  checkpoint: ReplicationCheckpoint;
  documents: Array<ParticipantDocument>;
};

export type PullVirtualChallengesResponse = {
  __typename?: 'PullVirtualChallengesResponse';
  checkpoint: ReplicationCheckpoint;
  documents: Array<VirtualChallengeDocument>;
};

export type Query = {
  __typename?: 'Query';
  event?: Maybe<Event>;
  events: Array<Event>;
  me?: Maybe<Me>;
  pointsNearby: CoordinatesConnection;
  pullCheckpoints: PullCheckpointsResponse;
  pullEvents: PullEventsResponse;
  pullParticipants: PullParticipantsResponse;
  pullVirtualChallenges: PullVirtualChallengesResponse;
  virtualChallenge?: Maybe<VirtualChallenge>;
  virtualChallenges: VirtualChallengeConnection;
};

export type QueryEventArgs = {
  id: Scalars['Int']['input'];
};

export type QueryPointsNearbyArgs = {
  input: PointsNearbyInput;
};

export type QueryPullCheckpointsArgs = {
  limit: Scalars['Int']['input'];
  minUpdatedAt: Scalars['DateTime']['input'];
};

export type QueryPullEventsArgs = {
  limit: Scalars['Int']['input'];
  minUpdatedAt: Scalars['DateTime']['input'];
};

export type QueryPullParticipantsArgs = {
  limit: Scalars['Int']['input'];
  minUpdatedAt: Scalars['DateTime']['input'];
};

export type QueryPullVirtualChallengesArgs = {
  limit: Scalars['Int']['input'];
  minUpdatedAt: Scalars['DateTime']['input'];
};

export type QueryVirtualChallengeArgs = {
  id: Scalars['Int']['input'];
};

export type ReplicationCheckpoint = {
  __typename?: 'ReplicationCheckpoint';
  lastModified: Scalars['Float']['output'];
};

export type SignInPayload = {
  __typename?: 'SignInPayload';
  accessToken?: Maybe<Scalars['String']['output']>;
  refreshToken?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type VirtualChallenge = {
  __typename?: 'VirtualChallenge';
  checkpoints: CoordinatesConnection;
  created_at: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  radius: Scalars['Int']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type VirtualChallengeConnection = {
  __typename?: 'VirtualChallengeConnection';
  nodes: Array<VirtualChallenge>;
  totalCount: Scalars['Int']['output'];
};

export type VirtualChallengeDocument = {
  __typename?: 'VirtualChallengeDocument';
  checkpoints: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  deleted: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type VirtualChallengeInput = {
  checkpoints: Scalars['String']['input'];
  created_at: Scalars['DateTime']['input'];
  deleted: Scalars['Boolean']['input'];
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  updated_at: Scalars['DateTime']['input'];
};
