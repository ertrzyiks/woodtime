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
import DeleteIcon from '@material-ui/icons/Delete';
import { Link } from 'react-router-dom';
import MissingCheckpointsArea from '../MissingCheckpointsArea/MissingCheckpointsArea';
import IconButton from '@material-ui/core/IconButton';
import { ActionsContext } from '../Storage/Storage';

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

const ScoreLauf = ({ event, newCheckpointPath }: Props) => {
  const actions = useContext(ActionsContext);
  const checkpoints = event.checkpoints;

  const handleDeleteClick = (checkpointId: string) => {
    actions?.deleteCheckpoint({ eventId: event.id, id: checkpointId });
  };

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        flexGrow: 1,
        padding: 20,
      },
      paper: {
        height: 100,
        width: 100,
      },
      item: {
        padding: 5,
      },
      control: {
        padding: theme.spacing(2),
      },
    })
  );

  const [spacing] = React.useState<GridSpacing>(2);

  const classes = useStyles();

  return (
    <div>
      <Typography>{event.name}</Typography>
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
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: 10,
                      }}
                    >
                      <div>
                        <span style={{ display: 'block' }}>
                          #{checkpoint.id}
                        </span>
                        <span style={{ display: 'block' }}>
                          {checkpoint.skipped ? 'skipped' : checkpoint.code}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                        }}
                      >
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeleteClick(checkpoint.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </div>
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
    </div>
  );
};

export default ScoreLauf;
