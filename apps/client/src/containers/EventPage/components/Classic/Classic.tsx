import { Box, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { OrienteeringEvent } from '../../../../types/OrienteeringEvent';
import MissingCheckpointsArea from '../../../../components/MissingCheckpointsArea/MissingCheckpointsArea';
import LinearProgressWithLabel from '../../../../components/LinearProgressWithLabel/LinearProgressWithLabel';
import CheckpointGridCell from '../../../../components/CheckpointGridCell/CheckpointGridCell';
import Participants from '../../../../components/Participants/Participants';

interface Props {
  event: OrienteeringEvent;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    gridContainer: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  }),
);

const Classic = ({ event }: Props) => {
  const classes = useStyles();
  const { id, name, checkpoints, checkpoint_count } = event;

  const allPoints = Array(checkpoint_count)
    .fill(checkpoint_count)
    .map((_, idx) => 1 + idx);

  return (
    <Box m={1}>
      <Typography variant="h6">{name}</Typography>

      <Participants list={event.participants} eventId={event.id} />

      <LinearProgressWithLabel
        current={checkpoints.length}
        max={checkpoint_count}
      />

      <Box
        className={classes.gridContainer}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {allPoints.map((p) => {
          const matchingPoint = checkpoints.find((ch) => ch.cp_id === p);

          return (
            <CheckpointGridCell
              key={p}
              checkpointNumber={p}
              checkpoint={matchingPoint}
              eventId={id}
            />
          );
        })}
      </Box>

      <MissingCheckpointsArea
        scoredIds={checkpoints.map((ch) => ch.cp_id)}
        max={event.checkpoint_count}
      />
    </Box>
  );
};

export default Classic;
