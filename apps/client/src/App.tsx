import React, {useEffect, useState} from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Link,
  CircularProgress,
  BottomNavigation,
  BottomNavigationAction
} from '@material-ui/core';
import PublicIcon from '@material-ui/icons/Public';
import EventIcon from '@material-ui/icons/Event';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouterLink,
  useHistory,
  useLocation,
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
import AddVirtualChallenge from './components/AddVirtualChallenge/AddVirtualChallenge';
import VirtualChallengeList from './components/VirtualChallengeList/VirtualChallengeList';
import VirtualChallenge from './components/VirtualChallenge/VirtualChallenge';
import PwaUpdateNotification from './components/PwaUpdateNofication/PwaUpdateNotification';
import {LocalStorageWrapper, persistCache} from "apollo3-cache-persist"
import InitialNavigationDetector from "./components/InitialNavigationDetector/InitialNavigationDetector";
import CheckpointsService, {Executor, ErrorReporter} from "./components/CheckpointsService/CheckpointsService";

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

function BottomBar({ className }: { className: string }) {
  const history = useHistory()
  const location = useLocation()

  if (location.pathname !== '/' && location.pathname !== '/virtual-challenges') {
    return null
  }

  return (
    <BottomNavigation
      value={location.pathname === '/' ? 0 : 1}
      onChange={(event, newValue) => {
        if (newValue === 0) {
          history.push('/')
        } else {
          history.push('/virtual-challenges')
        }
      }}
      showLabels
      className={className}
    >
      <BottomNavigationAction label="Events" icon={<EventIcon />} />
      <BottomNavigationAction label="Virtual Challenges" icon={<PublicIcon />} />
    </BottomNavigation>
  )
}

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
            <CheckpointsService>
              <Executor />
              <ErrorReporter />

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
                <Route path="/virtual-challenges" exact>
                  <VirtualChallengeList />
                </Route>
                <Route path="/virtual-challenges/new" exact>
                  <AddVirtualChallenge />
                </Route>
                <Route path="/virtual-challenges/:id" exact>
                  <VirtualChallenge />
                </Route>
              </Switch>
            </CheckpointsService>
          <BottomBar className={classes.bottomBar}/>
          </ApolloProvider>
        ) : (
          <div className={classes.loaderWrapper}>
            <CircularProgress />
          </div>
        )}
      </InitialNavigationDetector>
    </Router>
  );
}

export default App;
