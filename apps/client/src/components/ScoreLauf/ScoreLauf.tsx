import {
  Box,
  createStyles,
  Fab,
  Grid,
  GridSpacing,
  makeStyles,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core';
import React, { useContext } from 'react';
import { OrienteeringEvent } from '../../types/OrienteeringEvent';

import LinearProgress, {
  LinearProgressProps,
} from '@material-ui/core/LinearProgress';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';
import MissingCheckpointsArea from '../MissingCheckpointsArea/MissingCheckpointsArea';
import { ActionsContext } from '../Storage/Storage';
import CheckpointCard from '../CheckpointCard/CheckpointCard';

function LinearProgressWithLabel({
  current,
  max,
  ...props
}: LinearProgressProps & { current: number; max: number }) {
  const value = (100 * current) / max;

  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} value={value} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">
          {current}/{max}
        </Typography>
      </Box>
    </Box>
  );
}

interface Props {
  event: OrienteeringEvent;
  newCheckpointPath: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: 20,
    },
    paper: {
      width: 80,
    },
    item: {
      padding: 5,
    },
    control: {
      padding: theme.spacing(2),
    },
  })
);

const ScoreLauf = ({ event, newCheckpointPath }: Props) => {
  const checkpoints = event.checkpoints;

  const [spacing] = React.useState<GridSpacing>(2);

  const classes = useStyles();

  return (
    <Box m={1}>
      <Typography variant="h6">{event.name}</Typography>
      <LinearProgressWithLabel
        current={checkpoints.length}
        max={event.numberOfCheckpoints}
      />

      {checkpoints.length > 0 && (
        <Grid container className={classes.root} spacing={2}>
          <Grid item xs={12}>
            <Grid container justify="flex-start" spacing={spacing}>
              {checkpoints.map((checkpoint) => (
                <Grid key={checkpoint.id} item className={classes.item}>
                  <Paper className={classes.paper}>
                    <CheckpointCard
                      checkpoint={checkpoint}
                      eventId={event.id}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      <Fab
        color="primary"
        aria-label="add"
        component={Link}
        to={newCheckpointPath}
      >
        <AddIcon />
      </Fab>
      <MissingCheckpointsArea
        scoredIds={checkpoints.map((ch) => parseInt(ch.id, 10))}
        max={event.numberOfCheckpoints}
      />
    </Box>
  );
};

export default ScoreLauf;
