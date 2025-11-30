/* eslint-disable */
import * as Types from '../../../graphql/types.js';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { EventForListFragmentDoc } from '../../../queries/eventForListFragment';
export type JoinEventMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
  token: Types.Scalars['String'];
}>;


export type JoinEventMutation = { __typename?: 'Mutation', joinEvent: { __typename?: 'JoinEventPayload', success: boolean, event: { __typename?: 'Event', id: number, name: string, checkpoint_count: number, created_at: string } | null } | null };


export const JoinEventDocument = {"kind":"Document", "definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"JoinEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"joinEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventForList"}}]}}]}}]}},...EventForListFragmentDoc.definitions]} as unknown as DocumentNode<JoinEventMutation, JoinEventMutationVariables>;