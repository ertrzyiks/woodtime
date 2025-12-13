import { initialize, mswLoader } from 'msw-storybook-addon';
import { removeRxDatabase } from 'rxdb/plugins/core';
import { execute, parse } from 'graphql';
import { graphql, HttpResponse } from 'msw';
import getMockedApolloClient from '../src/support/storybook/getMockedApolloClient';
import { storage } from '../src/database/setup';

initialize({
  serviceWorker: { url: '/apiMockServiceWorker.js' },
});

const { schemaWithMocks, store, client } = getMockedApolloClient();

const mockGraphQLQuery = (operationName) => {
  return graphql.query(operationName, async ({ query, variables }) => {
    const response = await execute({
      schema: schemaWithMocks,
      document: parse(query),
      operationName,
      variableValues: variables,
    });

    return HttpResponse.json(response);
  });
};

const mockGraphQLMutation = (operationName) => {
  return graphql.mutation(operationName, async ({ query, variables }) => {
    const response = await execute({
      schema: schemaWithMocks,
      document: parse(query),
      operationName,
      variableValues: variables,
    });

    return HttpResponse.json(response);
  });
};

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  msw: {
    handlers: [
      mockGraphQLQuery('PullEvents'),
      mockGraphQLQuery('PullCheckpoints'),
      mockGraphQLQuery('PullVirtualChallenges'),
      mockGraphQLMutation('PushEvents'),
      mockGraphQLMutation('PushCheckpoints'),
      mockGraphQLMutation('PushVirtualChallenges'),
    ],
  },
};

const storeLoader = async () => {
  return { store, client };
};

const rxdbLoader = async () => {
  await removeRxDatabase('woodtime', storage, true);

  return {};
};

export const loaders = [mswLoader, rxdbLoader, storeLoader];
