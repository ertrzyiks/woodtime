import React from 'react'
import {addMocksToSchema, createMockStore} from "@graphql-tools/mock";
import schema from "../../graphql/schema";
import {ApolloClient, InMemoryCache} from "@apollo/client";
import {SchemaLink} from "@apollo/client/link/schema";

export default function getMockedApolloClient() {
  const store = createMockStore({
    schema,
    mocks: {
      DateTime: () => '2021-11-12T12:36:06.235Z',
      Checkpoint: () => {
        return ({
          skipped: false
        })
      }
    }
  })
  store.set('Query', 'ROOT', 'events', [
    { id: '1', name: 'Harpus', type: 1, checkpoint_count: 12 },
    { id: '2', name: 'Azymut', type: 2, checkpoint_count: 12 }
  ])

  const schemaWithMocks = addMocksToSchema({
    schema,
    store,
    resolvers: (store) => ({
      Query: {
        event: (_, { id }) => store.get('Event', id)
      }
    })
  })
  const cache = new InMemoryCache()
  const client = new ApolloClient({
    cache,
    link: new SchemaLink({
      schema: schemaWithMocks
    })
  })

  return { client, store }
}
