import React from 'react';
import {
  Switch,
  Route,
  BrowserRouter as Router,
} from 'react-router-dom';

import EventList from './containers/EventList/EventList';
import AddEvent from './containers/AddEvent/AddEvent';
import EventPage from './containers/EventPage/EventPage';
import EventInvitePage from './containers/EventInvitePage/EventInvitePage';
import AddCheckpointPage from './containers/AddCheckpointPage/AddCheckpointPage';
import AddVirtualChallenge from './containers/AddVirtualChallenge/AddVirtualChallenge';
import VirtualChallengeList from './containers/VirtualChallengeList/VirtualChallengeList';
import VirtualChallenge from './containers/VirtualChallenge/VirtualChallenge';
import AppShell from "./AppShell";
import Layout from "./Layout";
import SignIn from "./containers/SignIn/SignIn"
import JoinEvent from "./containers/JoinEvent/JoinEvent";

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AppShell>
        <Layout>
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
            <Route path="/events/:id/invite" exact>
              <EventInvitePage />
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
        </Layout>
      </AppShell>
    </Router>
  );
}

export default App;
