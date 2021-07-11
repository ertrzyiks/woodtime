import React from 'react';
import { useParams } from 'react-router-dom';
import ScoreLauf from '../ScoreLauf/ScoreLauf';
import { GET_EVENT } from '../../queries/event';
import { useQuery } from '@apollo/client';
import {useInitialNavigation} from "../../hooks/useInitialNavigation";

const EventPage = () => {
  const { id } = useParams<{ id: string }>();

  const isInitialNavigation = useInitialNavigation()

  const { loading, error, data } = useQuery(GET_EVENT, {
    variables: { id: parseInt(id, 10) },
    fetchPolicy: isInitialNavigation ? 'cache-and-network' : undefined,
    nextFetchPolicy: isInitialNavigation ? 'cache-first' : undefined
  });
  const event = data?.event;

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error :(</p>;
  }

  return (
    <ScoreLauf
      event={event}
      newCheckpointPath={`/events/${event.id}/add-checkpoint`}
    />
  );
};

export default EventPage;
