import React from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { AppBar, Toolbar, Typography, Link } from "@material-ui/core"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouterLink
} from "react-router-dom"

import EventList from './components/EventList/EventList'
import Storage from './components/Storage/Storage'
import AddEvent from "./components/AddEvent/AddEvent";
import EventPage from "./components/EventPage/EventPage";

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
  }),
);

function App() {
  const classes = useStyles()

  return (
    <Storage>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              <Link component={RouterLink} to='/' color='inherit'>
                Woodtime
              </Link>
            </Typography>
          </Toolbar>
        </AppBar>

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
        </Switch>
      </Router>
    </Storage>
  );
}

export default App;
