import { addMocksToSchema, createMockStore } from '@graphql-tools/mock';
import schema from '../../graphql/schema';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';

export default function getMockedApolloClient() {
  const store = createMockStore({
    schema,
    mocks: {
      EventDocument: () => ({
        deleted: false,
        checkpoint_count: 12,
      }),
      DateTime: () => '2021-11-12T12:36:06.235Z',
      Checkpoint: () => {
        return {
          skipped: false,
        };
      },
    },
  });
  store.set('Query', 'ROOT', 'events', [
    { id: '1', name: 'Harpus', type: 1, checkpoint_count: 12 },
    { id: '2', name: 'Azymut', type: 2, checkpoint_count: 12 },
  ]);

  store.set('Query', 'ROOT', 'pullEvents', {
    documents: [
      {
        id: '1',
        name: 'Harpus',
        type: 1,
      },
      {
        id: '2',
        name: 'Azymut',
        type: 2,
      },
    ],
    checkpoint: {
      lastModified: 0,
    },
  });

  const schemaWithMocks = addMocksToSchema({
    schema,
    store,
    resolvers: (store) => ({
      Query: {
        event: (_, { id }) => store.get('Event', id),
        pullEvents: (_, { since }) => store.get('Query', 'ROOT', 'pullEvents'),
      },
    }),
  });
  const cache = new InMemoryCache();
  const client = new ApolloClient({
    cache,
    link: new SchemaLink({
      schema: schemaWithMocks,
    }),
  });

  return { client, store, schemaWithMocks };
}
