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
import React, {useContext} from 'react';
import LinearProgressWithLabel from '../LinearProgressWithLabel/LinearProgressWithLabel'
import { OrienteeringEvent } from '../../types/OrienteeringEvent';

import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';
import MissingCheckpointsArea from '../MissingCheckpointsArea/MissingCheckpointsArea';
import CheckpointCard from '../CheckpointCard/CheckpointCard';
import Solution from '../Solution/Solution';
import {CheckpointsDispatchContext} from "../CheckpointsService/CheckpointsService";
import {useMutation} from "@apollo/client";
import {Checkpoint} from "../../types/Checkpoint";
import {DeleteCheckpointDocument} from "../../queries/deleteCheckpoint";
import Participants from "../Participants/Participants";


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
    pendingItem: {
      opacity: 0.7
    },
    control: {
      padding: theme.spacing(2),
    },
    addCheckpointButton: {
      position: 'absolute',
      right: '1em',
      bottom: '1em',
    },
  })
);

const ScoreLauf = ({ event, newCheckpointPath }: Props) => {
  const checkpoints = event.checkpoints;

  const [spacing] = React.useState<GridSpacing>(2);

  const classes = useStyles();

  const dispatch = useContext(CheckpointsDispatchContext)
  const [deleteCheckpoint] = useMutation(DeleteCheckpointDocument, {
    refetchQueries: ['getEvent'],
    awaitRefetchQueries: true,
  });

  const handleDeleteClick = (checkpoint: Checkpoint) => {
    if (checkpoint.pending) {
      return dispatch({
        type: 'delete',
        eventId: event.id,
        id: checkpoint.cp_id
      })
    }

    return deleteCheckpoint({ variables: { id: checkpoint.id } });
  };

  return (
    <Box m={1}>
      <Typography variant="h6">{event.name}</Typography>

      <Participants
        list={[]}
        eventId={event.id}
        inviteToken={event.invite_token}
      />

      <LinearProgressWithLabel
        current={checkpoints.length}
        max={event.checkpoint_count}
      />

      {checkpoints.length > 0 && (
        <Grid container className={classes.root} spacing={2}>
          <Grid item xs={12}>
            <Grid container justify="flex-start" spacing={spacing}>
              {checkpoints.map((checkpoint) => (
                <Grid key={checkpoint.cp_id} item className={[classes.item].concat(checkpoint.pending ? [classes.pendingItem] : []).join(' ')}>
                  <Paper className={classes.paper}>
                    <CheckpointCard
                      checkpoint={checkpoint}
                      eventId={event.id}
                      onDelete={handleDeleteClick}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      <Fab
        className={classes.addCheckpointButton}
        color="primary"
        aria-label="add"
        component={Link}
        to={newCheckpointPath}
      >
        <AddIcon />
      </Fab>
      <MissingCheckpointsArea
        scoredIds={checkpoints.map((ch) => ch.cp_id)}
        max={event.checkpoint_count}
      />
      <Solution checkpoints={checkpoints} max={event.checkpoint_count} />
    </Box>
  );
};

export default ScoreLauf;
