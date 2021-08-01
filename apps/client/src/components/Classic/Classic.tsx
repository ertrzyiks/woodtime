import {
  Box,
  Button,
  Checkbox,
  createStyles,
  Fab,
  Grid,
  GridSpacing,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { OrienteeringEvent } from '../../types/OrienteeringEvent';
import MissingCheckpointsArea from '../MissingCheckpointsArea/MissingCheckpointsArea';
import LinearProgressWithLabel from '../LinearProgressWithLabel/LinearProgressWithLabel';
import CheckpointListItem from '../CheckpointListItem/CheckpointListItem';

interface Props {
  event: OrienteeringEvent;
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
    addCheckpointButton: {
      position: 'absolute',
      right: '1em',
      bottom: '1em',
    },
  })
);

const Classic = ({ event }: Props) => {
  const { id, name, checkpoints, checkpoint_count } = event;

  const [spacing] = React.useState<GridSpacing>(2);

  const classes = useStyles();

  const [checked, setChecked] = React.useState([0]);

  const handleToggle = (value: number) => () => {
    console.log('toggle', value);
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  console.log('event', event);
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
          <CheckpointListItem id={p} checkpoint={matchingPoint} eventId={id} />
          // <ListItem
          //   key={p}
          //   role={undefined}
          //   dense
          //   button
          //   onClick={handleToggle(p)}
          // >
          //   <ListItemIcon>
          //     <Checkbox
          //       edge="start"
          //       checked={checked.indexOf(p) !== -1}
          //       tabIndex={-1}
          //       disableRipple
          //       inputProps={{ 'aria-labelledby': labelId }}
          //     />
          //   </ListItemIcon>
          //   <ListItemText id={labelId} primary={p} />
          //   <Button variant="contained">Skip</Button>
          // </ListItem>
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
