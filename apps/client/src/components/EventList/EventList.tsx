import React, { useContext } from 'react';
import { Fab, List, ListItem, ListItemText } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';
import { StorageContext } from '../Storage/Storage';
import format from 'date-fns/format';

const Event = ({
  id,
  name,
  createdAt,
}: {
  id: number;
  name: string;
  createdAt: string;
}) => (
  <ListItem button component={Link} to={`/events/${id}`}>
    <ListItemText primary={name} secondary={createdAt} />
  </ListItem>
);

const EventList = () => {
  const { events } = useContext(StorageContext);
  return (
    <div>
      <List>
        {events
          .sort((a: { id: number }, b: { id: number }) => b.id - a.id)
          .map(({ id, name, createdAt }) => (
            <Event
              key={id}
              id={id}
              name={name}
              createdAt={format(new Date(createdAt), 'dd/MM/yyyy')}
            />
          ))}
      </List>

      <Fab color="primary" aria-label="add" component={Link} to="/events/new">
        <AddIcon />
      </Fab>
    </div>
  );
};

export default EventList;
