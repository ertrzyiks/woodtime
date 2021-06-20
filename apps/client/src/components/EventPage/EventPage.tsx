import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { StorageContext } from '../Storage/Storage';
import ScoreLauf from '../ScoreLauf/ScoreLauf';

const EventPage = () => {
  const { id } = useParams<{ id: string }>();
  const { events } = useContext(StorageContext);

  const event = events.find((e) => e.id === parseInt(id, 10));

  if (!event) {
    return null;
  }

  return (
    <ScoreLauf
      event={event}
      newCheckpointPath={`/events/${event.id}/add-checkpoint`}
    />
  );
};

export default EventPage;
