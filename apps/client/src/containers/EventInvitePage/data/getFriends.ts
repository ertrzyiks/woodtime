/* eslint-disable */
import * as Types from '../../../graphql/types';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetFriendsQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetFriendsQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'Me';
    friends: Array<{ __typename?: 'User'; id: string; name: string }>;
  } | null;
};

export const GetFriendsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetFriends' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'me' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'friends' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetFriendsQuery, GetFriendsQueryVariables>;
