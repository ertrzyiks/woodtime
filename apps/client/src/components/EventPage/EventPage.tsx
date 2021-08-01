import React from 'react';
import { useQuery } from '@apollo/client';
import { useParams, Link as RouterLink } from 'react-router-dom';
import ScoreLauf from '../ScoreLauf/ScoreLauf';
import VirtualEvent from '../VirtualEvent/VirtualEvent';
import { GET_EVENT } from '../../queries/event';
import { useInitialNavigation } from '../../hooks/useInitialNavigation';
import { Box, Breadcrumbs, Link, Typography } from '@material-ui/core';
import EventIcon from '@material-ui/icons/Event';
import { useBreadcrumbStyles } from '../../hooks/useBreadcrumbStyles';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import Classic from '../Classic/Classic';

const EVENT_TYPES = {
  SCORE: 1,
  CLASSIC: 2,
};

const EventPage = () => {
  const { id } = useParams<{ id: string }>();

  const classes = useBreadcrumbStyles();
  const isInitialNavigation = useInitialNavigation();

  const { loading, error, data } = useQuery(GET_EVENT, {
    variables: { id: parseInt(id, 10) },
    fetchPolicy: isInitialNavigation ? 'cache-and-network' : undefined,
    nextFetchPolicy: isInitialNavigation ? 'cache-first' : undefined,
  });
  const event = data?.event;

  if (loading && !data) {
    return <p>Loading...</p>;
  }

  const eventContent =
    event.type === EVENT_TYPES.SCORE ? (
      <ScoreLauf
        event={event}
        newCheckpointPath={`/events/${event.id}/add-checkpoint`}
      />
    ) : (
      <Classic event={event} />
    );

  return (
    <div>
      <Box px={1} py={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            component={RouterLink}
            to="/"
            className={classes.link}
          >
            <EventIcon className={classes.icon} />
            Events
          </Link>
          <Typography color="textPrimary">{event.name}</Typography>
        </Breadcrumbs>
      </Box>

      <LoadingIndicator active={loading} />

      {error && <p>Error :(</p>}

      {(event.type === 3 && event.virtual_challenge) ? (
        <VirtualEvent
          event={event}
          virtualChallenge={event.virtual_challenge}
          newCheckpointPath={`/events/${event.id}/add-checkpoint`}
        />
      ) : eventContent}
    </div>
  );
};

export default EventPage;
