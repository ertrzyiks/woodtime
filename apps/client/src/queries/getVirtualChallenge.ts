/* eslint-disable */
import * as Types from '../graphql/types.js';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetVirtualChallengeQueryVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;


export type GetVirtualChallengeQuery = { __typename?: 'Query', virtualChallenge: { __typename?: 'VirtualChallenge', id: number, name: string, createdAt: string, checkpoints: { __typename?: 'CoordinatesConnection', totalCount: number, points: Array<{ __typename?: 'Coordinates', lat: string, lng: string }> } } | null };


export const GetVirtualChallengeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getVirtualChallenge"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"virtualChallenge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"createdAt"},"name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"checkpoints"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"points"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetVirtualChallengeQuery, GetVirtualChallengeQueryVariables>;