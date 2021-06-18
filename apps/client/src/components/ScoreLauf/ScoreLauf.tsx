import {Box, Fab, List, ListItem, ListItemText, Typography} from '@material-ui/core';
import React from 'react'
import {OrienteeringEvent} from "../../types/OrienteeringEvent";

import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';
import MissingCheckpointsArea from "../MissingCheckpointsArea/MissingCheckpointsArea";

function LinearProgressWithLabel({ current, max, ...props}: LinearProgressProps & { current: number, max: number }) {
  const value = 100 * current / max

  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} value={value} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{current}/{max}</Typography>
      </Box>
    </Box>
  );
}

interface Props {
  event: OrienteeringEvent
  newCheckpointPath: string
}

const ScoreLauf = ({ event, newCheckpointPath }: Props) => {
  const checkpoints = event.checkpoints
  return (
    <div>
      <Typography>{event.name}</Typography>
      <LinearProgressWithLabel current={checkpoints.length} max={event.numberOfCheckpoints} />

      {checkpoints.length > 0 && (
        <List>
          {checkpoints.map(checkpoint => (
            <ListItem key={checkpoint.id}>
              <ListItemText primary={checkpoint.id} secondary={checkpoint.code} />
            </ListItem>
          ))}
        </List>
      )}

      <Fab color="primary" aria-label="add" component={Link} to={newCheckpointPath}>
        <AddIcon />
      </Fab>
        <MissingCheckpointsArea scoredIds={checkpoints.map(ch => parseInt(ch.id, 10))} max={event.numberOfCheckpoints} />
    </div>
  )
}

export default ScoreLauf
