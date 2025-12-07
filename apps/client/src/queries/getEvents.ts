/* eslint-disable */
import * as Types from '../graphql/types';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { EventForListFragmentDoc } from './eventForListFragment';
export type GetEventsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetEventsQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', id: number, name: string, checkpoint_count: number, created_at: string }> };


export const GetEventsDocument = {"kind":"Document", "definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventForList"}}]}}]}},...EventForListFragmentDoc.definitions]} as unknown as DocumentNode<GetEventsQuery, GetEventsQueryVariables>;