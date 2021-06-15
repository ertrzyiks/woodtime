import React from 'react'
import {Fab, List, ListItem, ListItemText} from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import {Link} from "react-router-dom";

const Event = ({ id, name }: { id: string, name: string }) => (
  <ListItem button component={Link} to={`/event/${id}`}>
    <ListItemText primary={name} secondary="Jan 9, 2014" />
  </ListItem>
)

const EventList = () => {
  return (
    <div>
      <List>
        <Event id='1' name='Harpuś 58' />
        <Event id='2' name='Harpuś 59' />
      </List>

      <Fab color="primary" aria-label="add">
        <AddIcon />
      </Fab>
    </div>

  )
}

export default EventList
