import React, { useContext } from 'react';
import {
  createStyles,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Theme,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import { Link } from 'react-router-dom';
import { ActionsContext, StorageContext } from '../Storage/Storage';
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      display: 'flex',
      width: '100%',
    },
    deleteIcon: {
      // position: 'absolute',
      // top: -3,
      // right: -5,
    },
  })
);

const EventList = () => {
  const actions = useContext(ActionsContext);

  const handleDeleteClick = (eventId: number) => {
    actions?.deleteEvent(eventId);
  };

  const classes = useStyles();

  const { events } = useContext(StorageContext);
  return (
    <div>
      <List>
        {events
          .sort((a: { id: number }, b: { id: number }) => b.id - a.id)
          .map(({ id, name, createdAt }) => (
            <div className={classes.wrapper}>
              <Event
                key={id}
                id={id}
                name={name}
                createdAt={format(new Date(createdAt), 'dd/MM/yyyy')}
              />
              <div className={classes.deleteIcon}>
                <IconButton
                  aria-label="delete"
                  onClick={() => handleDeleteClick(id)}
                >
                  <ClearIcon />
                </IconButton>
              </div>
            </div>
          ))}
      </List>

      <Fab color="primary" aria-label="add" component={Link} to="/events/new">
        <AddIcon />
      </Fab>
    </div>
  );
};

export default EventList;
