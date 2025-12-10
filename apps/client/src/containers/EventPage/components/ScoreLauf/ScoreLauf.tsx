import {
  Box,
  Fab,
  Grid,
  GridSpacing,
  Paper,
  Typography,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { useState, useContext } from 'react';
import LinearProgressWithLabel from '../../../../components/LinearProgressWithLabel/LinearProgressWithLabel'
import { OrienteeringEvent } from '../../../../types/OrienteeringEvent';

import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import MissingCheckpointsArea from '../../../../components/MissingCheckpointsArea/MissingCheckpointsArea';
import CheckpointCard from '../../../../components/CheckpointCard/CheckpointCard';
import Solution from '../../../../components/Solution/Solution';
import {CheckpointsDispatchContext} from "../../../../components/CheckpointsService/CheckpointsService";
import {Checkpoint} from "../../../../types/Checkpoint";
import Participants from "../../../../components/Participants/Participants";
import {useRxDB} from "../../../../database/RxDBProvider";


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

  const [spacing] = useState<GridSpacing>(2);

  const classes = useStyles();

  const dispatch = useContext(CheckpointsDispatchContext)
  const { db } = useRxDB();

  const handleDeleteClick = async (checkpoint: Checkpoint) => {
    if (checkpoint.pending) {
      return dispatch({
        type: 'delete',
        eventId: event.id,
        id: checkpoint.cp_id
      })
    }

    if (!db) return;
    
    const checkpointDoc = await db.checkpoints.findOne({
      selector: { id: checkpoint.id }
    }).exec();
    
    if (checkpointDoc) {
      await checkpointDoc.update({
        $set: {
          deleted: true,
          _modified: Date.now()
        }
      });
    }
  };

  return (
    <Box m={1}>
      <Typography variant="h6">{event.name}</Typography>

      <Participants
        list={event.participants}
        eventId={event.id}
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
