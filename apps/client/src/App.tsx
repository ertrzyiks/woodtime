import React, {useEffect, useState} from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Link } from '@material-ui/core';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouterLink,
} from 'react-router-dom';
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';

import EventList from './components/EventList/EventList';
import AddEvent from './components/AddEvent/AddEvent';
import EventPage from './components/EventPage/EventPage';
import AddCheckpointPage from './components/AddCheckpointPage/AddCheckpointPage';
import PwaUpdateNotification from './components/PwaUpdateNofication/PwaUpdateNotification';
import {LocalStorageWrapper, persistCache} from "apollo3-cache-persist"
import InitialNavigationDetector from "./components/InitialNavigationDetector/InitialNavigationDetector";

const getLink = () => {
  return createHttpLink({
    uri:
      process.env.REACT_APP_GRAPHQL_ENDPOINT ||
      'http://localhost:8080/woodtime',
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
  })
);

function App() {
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
          link: getLink()
        }),
      );
    }

    init().catch(console.error);
  }, [setClient])

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <PwaUpdateNotification />

      <InitialNavigationDetector>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              <Link component={RouterLink} to="/" color="inherit">
                Woodtime
              </Link>
            </Typography>
          </Toolbar>
        </AppBar>

        {client ? (
          <ApolloProvider client={client}>
            <Switch>
              <Route path="/" exact>
                <EventList />
              </Route>
              <Route path="/events/new" exact>
                <EventList />
                <AddEvent />
              </Route>
              <Route path="/events/:id" exact>
                <EventPage />
              </Route>
              <Route path="/events/:id/add-checkpoint" exact>
                <AddCheckpointPage />
              </Route>
            </Switch>
          </ApolloProvider>
        ) : (
          <div>Loading...</div>
        )}
      </InitialNavigationDetector>
    </Router>
  );
}

export default App;
