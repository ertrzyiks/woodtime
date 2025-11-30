/* eslint-disable */
import * as Types from '../graphql/types.js';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type CreateVirtualChallengeMutationVariables = Types.Exact<{
  input: Types.CreateVirtualChallengeInput;
}>;


export type CreateVirtualChallengeMutation = { __typename?: 'Mutation', createVirtualChallenge: { __typename?: 'CreateVirtualChallengeResult', success: boolean, virtualChallenge: { __typename?: 'VirtualChallenge', id: number, name: string, checkpoints: { __typename?: 'CoordinatesConnection', totalCount: number, points: Array<{ __typename?: 'Coordinates', lat: string, lng: string }> } } | null } };


export const CreateVirtualChallengeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateVirtualChallenge"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateVirtualChallengeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createVirtualChallenge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"virtualChallenge"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"checkpoints"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"points"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateVirtualChallengeMutation, CreateVirtualChallengeMutationVariables>;