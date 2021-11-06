import React, {useEffect, useState} from 'react';
import { onError } from "@apollo/client/link/error";
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
  ApolloLink,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';

import EventList from './containers/EventList/EventList';
import AddEvent from './containers/AddEvent/AddEvent';
import EventPage from './containers/EventPage/EventPage';
import AddCheckpointPage from './containers/AddCheckpointPage/AddCheckpointPage';
import AddVirtualChallenge from './containers/AddVirtualChallenge/AddVirtualChallenge';
import VirtualChallengeList from './containers/VirtualChallengeList/VirtualChallengeList';
import VirtualChallenge from './containers/VirtualChallenge/VirtualChallenge';
import PwaUpdateNotification from './components/PwaUpdateNofication/PwaUpdateNotification';
import {LocalStorageWrapper, persistCache} from "apollo3-cache-persist"
import InitialNavigationDetector from "./components/InitialNavigationDetector/InitialNavigationDetector";
import CheckpointsService from "./components/CheckpointsService/CheckpointsService";
import Executor from "./components/CheckpointsService/Executor";
import ErrorReporter from "./components/CheckpointsService/ErrorReporter";
import SignIn from "./containers/SignIn/SignIn"
import JoinEvent from "./containers/JoinEvent/JoinEvent";
import { init as initI18n } from './i18n'
import {useTranslation} from "react-i18next";

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
  const { t } = useTranslation()
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
      <BottomNavigationAction label={t('navigation.events')} icon={<EventIcon />} />
      <BottomNavigationAction label={t('navigation.virtual_challenges')} icon={<PublicIcon />} />
    </BottomNavigation>
  )
}

initI18n()

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
          link: ApolloLink.from([errorLink, getLink()])
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
                <Route path="/join/:id" exact>
                  <JoinEvent />
                </Route>
                <Route path="/sign-in" exact>
                  <SignIn />
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
