import {
  Box,
  Breadcrumbs,
  createStyles,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import EventIcon from '@material-ui/icons/Event';
import ListIcon from '@material-ui/icons/List';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';
import { useMutation, useQuery } from '@apollo/client';
import { GET_EVENTS, DELETE_EVENT } from '../../queries';
import SimpleChecklist from '../SimpleChecklist/SimpleChecklist';
import React, { useState } from 'react';
import { useInitialNavigation } from '../../hooks/useInitialNavigation';
import { useBreadcrumbStyles } from '../../hooks/useBreadcrumbStyles';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';

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
    icons: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    listWrapper: {},
    addEventButton: {
      position: 'absolute',
      right: '1em',
      bottom: '1em',
    },
  })
);

const EventList = () => {
  const isInitialNavigation = useInitialNavigation();
  const { loading, error, data } = useQuery(GET_EVENTS, {
    fetchPolicy: isInitialNavigation ? 'cache-and-network' : undefined,
    nextFetchPolicy: isInitialNavigation ? 'cache-first' : undefined,
  });
  const [showChecklist, setShowChecklist] = useState(false);

  const [deleteEvent] = useMutation(DELETE_EVENT, {
    refetchQueries: ['getEvents'],
    awaitRefetchQueries: true,
  });

  const handleChecklistClick = () => {
    setShowChecklist(true);
  };

  const handleChecklistClose = () => {
    setShowChecklist(false);
  };

  const handleDeleteClick = (eventId: number) => {
    return deleteEvent({ variables: { id: eventId } });
  };

  const classes = useStyles();
  const breadcrumbClasses = useBreadcrumbStyles();

  if (loading && !data) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error :(</p>;
  }

  return (
    <div className={classes.listWrapper}>
      <Box px={1} py={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <Typography color="textPrimary" className={breadcrumbClasses.link}>
            <EventIcon className={breadcrumbClasses.icon} />
            Events
          </Typography>
        </Breadcrumbs>
      </Box>

      <LoadingIndicator active={loading} />

      {error && <p>Error :(</p>}

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
              <div className={classes.wrapper} key={id}>
                <Event id={id} name={name} createdAt={created_at} />
                <div className={classes.icons}>
                  <IconButton
                    aria-label="checklist"
                    onClick={() => handleChecklistClick()}
                  >
                    <ListIcon />
                  </IconButton>
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

      {showChecklist && <SimpleChecklist handleClose={handleChecklistClose} />}
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
