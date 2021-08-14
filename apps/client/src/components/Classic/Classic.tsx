import { Box, Typography } from '@material-ui/core';
import React from 'react';
import { OrienteeringEvent } from '../../types/OrienteeringEvent';
import MissingCheckpointsArea from '../MissingCheckpointsArea/MissingCheckpointsArea';
import LinearProgressWithLabel from '../LinearProgressWithLabel/LinearProgressWithLabel';
import CheckpointListItem from '../CheckpointListItem/CheckpointListItem';

interface Props {
  event: OrienteeringEvent;
}

const Classic = ({ event }: Props) => {
  const { id, name, checkpoints, checkpoint_count } = event;

  const allPoints = Array(checkpoint_count)
    .fill(checkpoint_count)
    .map((_, idx) => 1 + idx);

  return (
    <Box m={1}>
      <Typography variant="h6">{name}</Typography>
      <LinearProgressWithLabel
        current={checkpoints.length}
        max={checkpoint_count}
      />
      {allPoints.map((p) => {
        const matchingPoint = checkpoints.find((ch) => ch.cp_id === p);

        return (
          <CheckpointListItem
            id={p}
            key={p}
            checkpoint={matchingPoint}
            eventId={id}
          />
        );
      })}

      <MissingCheckpointsArea
        scoredIds={checkpoints.map((ch) => ch.cp_id)}
        max={event.checkpoint_count}
      />
    </Box>
  );
};

export default Classic;
