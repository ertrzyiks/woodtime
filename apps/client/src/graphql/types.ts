export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type CheckInViertualCheckpointResult = {
  __typename?: 'CheckInViertualCheckpointResult';
  checkpoint?: Maybe<Checkpoint>;
  success: Scalars['Boolean'];
};

export type Checkpoint = {
  __typename?: 'Checkpoint';
  cp_code?: Maybe<Scalars['String']>;
  cp_id: Scalars['Int'];
  created_at: Scalars['String'];
  event_id: Scalars['Int'];
  id?: Maybe<Scalars['Int']>;
  skip_reason?: Maybe<Scalars['String']>;
  skipped?: Maybe<Scalars['Boolean']>;
  updated_at: Scalars['String'];
};

export type Coordinates = {
  __typename?: 'Coordinates';
  lat: Scalars['String'];
  lng: Scalars['String'];
};

export type CoordinatesConnection = {
  __typename?: 'CoordinatesConnection';
  points: Array<Coordinates>;
  totalCount: Scalars['Int'];
};

export type CoordinatesInput = {
  lat: Scalars['String'];
  lng: Scalars['String'];
};

export type CreateCheckpointResult = {
  __typename?: 'CreateCheckpointResult';
  checkpoint?: Maybe<Checkpoint>;
  success: Scalars['Boolean'];
};

export type CreateEventResult = {
  __typename?: 'CreateEventResult';
  event: Event;
  success: Scalars['Boolean'];
};

export type CreateUserPayload = {
  __typename?: 'CreateUserPayload';
  accessToken?: Maybe<Scalars['String']>;
  refreshToken?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
  user?: Maybe<User>;
};

export type CreateVirtualChallengeInput = {
  checkpoints?: Maybe<Array<Maybe<CoordinatesInput>>>;
  name: Scalars['String'];
};

export type CreateVirtualChallengeResult = {
  __typename?: 'CreateVirtualChallengeResult';
  success: Scalars['Boolean'];
  virtualChallenge?: Maybe<VirtualChallenge>;
};

export type DeleteCheckpointResult = {
  __typename?: 'DeleteCheckpointResult';
  id: Scalars['Int'];
  success: Scalars['Boolean'];
};

export type DeleteEventResult = {
  __typename?: 'DeleteEventResult';
  id: Scalars['Int'];
  success: Scalars['Boolean'];
};

export type EnrollVirtualChallengeResult = {
  __typename?: 'EnrollVirtualChallengeResult';
  event?: Maybe<Event>;
  success: Scalars['Boolean'];
};

export type Event = {
  __typename?: 'Event';
  checkpoint_count: Scalars['Int'];
  checkpoints: Array<Checkpoint>;
  created_at: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
  type: Scalars['Int'];
  updated_at: Scalars['String'];
  virtual_challenge?: Maybe<EventVirtualChallenge>;
};

export type EventVirtualChallenge = {
  __typename?: 'EventVirtualChallenge';
  id: Scalars['Int'];
};

export type JoinEventPayload = {
  __typename?: 'JoinEventPayload';
  event?: Maybe<Event>;
  success: Scalars['Boolean'];
};

export type LoginPayload = {
  __typename?: 'LoginPayload';
  accessToken?: Maybe<Scalars['String']>;
  refreshToken?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
  user?: Maybe<User>;
};

export type Mutation = {
  __typename?: 'Mutation';
  checkInVirtualCheckpoint: CheckInViertualCheckpointResult;
  createCheckpoint: CreateCheckpointResult;
  createEvent?: Maybe<CreateEventResult>;
  createUser?: Maybe<CreateUserPayload>;
  createVirtualChallenge: CreateVirtualChallengeResult;
  deleteCheckpoint: DeleteCheckpointResult;
  deleteEvent?: Maybe<DeleteEventResult>;
  enrollVirtualChallenge: EnrollVirtualChallengeResult;
  joinEvent?: Maybe<JoinEventPayload>;
  login?: Maybe<LoginPayload>;
};


export type MutationCheckInVirtualCheckpointArgs = {
  event_id: Scalars['Int'];
  position: CoordinatesInput;
};


export type MutationCreateCheckpointArgs = {
  cp_code?: Maybe<Scalars['String']>;
  cp_id: Scalars['Int'];
  event_id: Scalars['Int'];
  skip_reason?: Maybe<Scalars['String']>;
  skipped?: Maybe<Scalars['Boolean']>;
};


export type MutationCreateEventArgs = {
  checkpointCount: Scalars['Int'];
  name: Scalars['String'];
  type: Scalars['Int'];
};


export type MutationCreateUserArgs = {
  name: Scalars['String'];
};


export type MutationCreateVirtualChallengeArgs = {
  input: CreateVirtualChallengeInput;
};


export type MutationDeleteCheckpointArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteEventArgs = {
  id: Scalars['Int'];
};


export type MutationEnrollVirtualChallengeArgs = {
  id: Scalars['Int'];
};


export type MutationJoinEventArgs = {
  id: Scalars['String'];
};


export type MutationLoginArgs = {
  token: Scalars['String'];
};

export type PointsNearbyInput = {
  count: Scalars['Int'];
  radius: Scalars['Int'];
  start: CoordinatesInput;
};

export type Query = {
  __typename?: 'Query';
  event?: Maybe<Event>;
  events: Array<Event>;
  me?: Maybe<User>;
  pointsNearby: CoordinatesConnection;
  virtualChallenge?: Maybe<VirtualChallenge>;
  virtualChallenges: VirtualChallengeConnection;
};


export type QueryEventArgs = {
  id: Scalars['Int'];
};


export type QueryPointsNearbyArgs = {
  input: PointsNearbyInput;
};


export type QueryVirtualChallengeArgs = {
  id: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['String'];
  name: Scalars['String'];
};

export type VirtualChallenge = {
  __typename?: 'VirtualChallenge';
  checkpoints: CoordinatesConnection;
  created_at: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
  radius: Scalars['Int'];
  updated_at: Scalars['String'];
};

export type VirtualChallengeConnection = {
  __typename?: 'VirtualChallengeConnection';
  nodes: Array<VirtualChallenge>;
  totalCount: Scalars['Int'];
};
