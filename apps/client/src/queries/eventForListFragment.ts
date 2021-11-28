import * as Types from '../graphql/types';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type EventForListFragment = { __typename?: 'Event', id: number, name: string, checkpoint_count: number, created_at: string };

export const EventForListFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventForList"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"checkpoint_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]} as unknown as DocumentNode<EventForListFragment, unknown>;