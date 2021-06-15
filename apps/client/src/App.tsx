import React from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { AppBar, Toolbar, Typography } from "@material-ui/core"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom"

import EventList from './components/EventList/EventList'

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
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Woodtime
          </Typography>
        </Toolbar>
      </AppBar>

      <Switch>
        <Route path="/">
          <EventList />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
