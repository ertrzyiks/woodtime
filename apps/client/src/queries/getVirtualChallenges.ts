/* eslint-disable */
import * as Types from '../graphql/types.js';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetVirtualChallengesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetVirtualChallengesQuery = { __typename?: 'Query', virtualChallenges: { __typename?: 'VirtualChallengeConnection', nodes: Array<{ __typename?: 'VirtualChallenge', id: number, name: string, createdAt: string, checkpoints: { __typename?: 'CoordinatesConnection', totalCount: number, points: Array<{ __typename?: 'Coordinates', lat: string, lng: string }> } }> } };


export const GetVirtualChallengesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getVirtualChallenges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"virtualChallenges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"createdAt"},"name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"checkpoints"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"points"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetVirtualChallengesQuery, GetVirtualChallengesQueryVariables>;