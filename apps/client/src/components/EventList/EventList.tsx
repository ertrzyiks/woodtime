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
import format from 'date-fns/format';
import { useMutation, useQuery } from '@apollo/client';
import { GET_EVENTS, DELETE_EVENT } from '../../queries';

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
    <ListItemText
      primary={name}
      secondary={format(new Date(createdAt), 'dd/MM/yyyy')}
    />
  </ListItem>
);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      display: 'flex',
      width: '100%',
    },
    deleteIcon: {},
    listWrapper: {},
    addEventButton: {
      position: 'absolute',
      right: '1em',
      bottom: '1em'
    },
  })
);

const EventList = () => {
  const { loading, error, data } = useQuery(GET_EVENTS);

  const [deleteEvent] = useMutation(DELETE_EVENT, {
    refetchQueries: ['getEvents'],
    awaitRefetchQueries: true,
  });

  const handleDeleteClick = (eventId: number) => {
    return deleteEvent({ variables: { id: eventId } });
  };

  const classes = useStyles();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error :(</p>;
  }

  return (
    <div className={classes.listWrapper}>
      <List>
        {[...data.events]
          .sort((a: { id: number }, b: { id: number }) => b.id - a.id)
          // TODO: generate types
          .map(
            ({
              id,
              name,
              created_at,
            }: {
              id: number;
              name: string;
              created_at: string;
            }) => (
              <div className={classes.wrapper}>
                <Event key={id} id={id} name={name} createdAt={created_at} />
                <div className={classes.deleteIcon}>
                  <IconButton
                    aria-label="delete"
                    onClick={() => handleDeleteClick(id)}
                  >
                    <ClearIcon />
                  </IconButton>
                </div>
              </div>
            )
          )}
      </List>

      <Fab
        className={classes.addEventButton}
        color="primary"
        aria-label="add"
        component={Link}
        to="/events/new"
      >
        <AddIcon />
      </Fab>
    </div>
  );
};

export default EventList;
