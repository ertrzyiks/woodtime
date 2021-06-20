import React, { useContext } from 'react';
import { Fab, List, ListItem, ListItemText } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';
import { StorageContext } from '../Storage/Storage';

const Event = ({ id, name }: { id: string; name: string }) => (
  <ListItem button component={Link} to={`/events/${id}`}>
    <ListItemText primary={name} secondary="Jan 9, 2014" />
  </ListItem>
);

const EventList = () => {
  const { events } = useContext(StorageContext);
  return (
    <div>
      <List>
        {events.map(({ id, name }) => (
          <Event key={id} id={id} name={name} />
        ))}
      </List>

      <Fab color="primary" aria-label="add" component={Link} to="/events/new">
        <AddIcon />
      </Fab>
    </div>
  );
};

export default EventList;
