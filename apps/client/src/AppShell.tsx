import React, {useEffect, useState, ReactNode} from 'react';
import { onError } from "@apollo/client/link/error";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  CircularProgress,
} from '@material-ui/core';

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';

import {LocalStorageWrapper, persistCache} from "apollo3-cache-persist"
import InitialNavigationDetector from "./components/InitialNavigationDetector/InitialNavigationDetector";
import CheckpointsService from "./components/CheckpointsService/CheckpointsService";
import Executor from "./components/CheckpointsService/Executor";
import ErrorReporter from "./components/CheckpointsService/ErrorReporter";
import { init as initI18n } from './i18n'
import PwaUpdateNotification from "./components/PwaUpdateNofication/PwaUpdateNotification";

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({extensions}) => {
      if (extensions && extensions.code === 'UNAUTHENTICATED') {
        window.location.href = '/sign-in?redirect_url=' + encodeURIComponent(window.location.href)
      }
    });
  }
})

const getLink = () => {
  return createHttpLink({
    credentials: 'include',
    uri:
      process.env.REACT_APP_GRAPHQL_ENDPOINT ||
      'https://localhost:8080/woodtime',
  });
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    loaderWrapper: {
      alignItems: 'center',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      display: 'flex'
    },
    bottomBar: {
      position: 'fixed',
      bottom: 0,
      width: '100%'
    }
  })
);


initI18n()

function AppShell({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null)
  const classes = useStyles()

  useEffect(() => {
    async function init() {
      const cache = new InMemoryCache()

      await persistCache({
        cache,
        storage: new LocalStorageWrapper(window.localStorage),
      })
      setClient(
        new ApolloClient({
          cache,
          link: ApolloLink.from([errorLink, getLink()])
        }),
      );
    }

    init().catch(console.error);
  }, [setClient])

  return (
    <>
      <PwaUpdateNotification />

      {client ? (
        <ApolloProvider client={client}>
          <InitialNavigationDetector>
            <CheckpointsService>
              <Executor />
              <ErrorReporter />

              {children}
            </CheckpointsService>
          </InitialNavigationDetector>
        </ApolloProvider>
      ) : (
        <div className={classes.loaderWrapper}>
          <CircularProgress />
        </div>
      )}
    </>
  )
}

export default AppShell;
