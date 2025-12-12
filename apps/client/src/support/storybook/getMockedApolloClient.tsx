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
      CheckpointDocument: () => ({
        skipped: false,
        deleted: false,
      }),
      DateTime: () => '2021-11-12T12:36:06.235Z',
      Checkpoint: () => {
        return {
          skipped: false,
        };
      },
    },
  });
  store.set('Query', 'ROOT', 'events', [{ id: '1' }, { id: '2' }]);

  store.set('PullEventsResponse', 'pull-events-1', {
    documents: [{ id: '1' }, { id: '2' }],
  });

  store.set('EventDocument', '1', {
    id: '1',
    name: 'Harpus',
    type: 1,
    checkpoint_count: 12,
  });

  store.set('EventDocument', '2', {
    id: '2',
    name: 'Azymut',
    type: 2,
    checkpoint_count: 12,
  });

  store.set(
    'Query',
    'ROOT',
    'pullEvents', // field name
    {
      documents: [{ id: '1' }, { id: '2' }],
    },
  );

  store.set('PullEventsResponse', 'ROOT', {
    documents: [{ id: '1' }, { id: '2' }],
  });

  store.set('PullCheckpointsResponse', 'ROOT', {
    documents: [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
      { id: '6' },
      { id: '7' },
      { id: '8' },
      { id: '9' },
      { id: '10' },
      { id: '11' },
      { id: '12' },
    ],
  });

  const schemaWithMocks = addMocksToSchema({
    schema,
    store,
    resolvers: (store) => ({
      Query: {
        event: (_, { id }) => store.get('Event', id),
        pullEvents: (_, { since }) => {
          return store.get('PullEventsResponse', 'ROOT');
        },
        pullCheckpoints: (_, { since }) => {
          return store.get('PullCheckpointsResponse', 'ROOT');
        },
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
