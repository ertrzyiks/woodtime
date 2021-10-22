import React from 'react';
import { Checkpoint } from '../../types/Checkpoint';
import {
  Button,
  Checkbox,
  createStyles,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CreateCheckpointDocument } from '../../queries/createCheckpoint';
import { DeleteCheckpointDocument } from '../../queries/deleteCheckpoint';

interface Props {
  id: number;
  checkpoint?: Checkpoint;
  eventId: number;
}

interface Values {
  eventId: number;
  cpId: number;
  cpCode?: string;
  skipped?: boolean;
  skipReason?: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    skippedText: {
      fontStyle: 'italic',
    },
  })
);

const CheckpointListItem = ({ id, checkpoint, eventId }: Props) => {
  const labelId = `checkbox-list-label-${id}`;

  const history = useHistory();

  const [createCheckpoint, { loading: creationLoading, error: creationError }] =
    useMutation<any, Values>(CreateCheckpointDocument, {
      refetchQueries: ['getEvent'],
      awaitRefetchQueries: true,
      onCompleted: (data) => {
        history.push(`/events/${data.createCheckpoint.checkpoint.event_id}`);
      },
    });

  const [deleteCheckpoint] = useMutation(DeleteCheckpointDocument, {
    refetchQueries: ['getEvent'],
    awaitRefetchQueries: true,
  });

  const handleToggle = (value: number) => {
    if (checkpoint) {
      return deleteCheckpoint({ variables: { id: checkpoint.id } });
    }

    try {
      return createCheckpoint({
        variables: {
          eventId,
          cpId: value,
          cpCode: undefined,
          skipped: false,
          skipReason: undefined,
        },
      });
    } catch (err) {
      throw err;
    }
  };

  const handleSkipClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    checkpointId: number
  ) => {
    e.stopPropagation();

    try {
      return createCheckpoint({
        variables: {
          eventId,
          cpId: checkpointId,
          cpCode: undefined,
          skipped: true,
          skipReason: undefined,
        },
      });
    } catch (err) {
      throw err;
    }
  };

  const classes = useStyles();

  if (creationLoading) {
    return <p>Loading...</p>;
  }

  if (creationError) {
    return <p>Error :(</p>;
  }

  const skipButton = !checkpoint && (
    <Button variant="contained" onClick={(e) => handleSkipClick(e, id)}>
      Skip
    </Button>
  );

  const skippedText = checkpoint && checkpoint.skipped && (
    <span className={classes.skippedText}>skipped</span>
  );

  return (
    <ListItem
      key={id}
      role={undefined}
      dense
      button
      onClick={() => handleToggle(id)}
    >
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={checkpoint != null}
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-labelledby': labelId }}
        />
      </ListItemIcon>
      <ListItemText id={labelId} primary={id} />
      {skippedText}
      {skipButton}
    </ListItem>
  );
};

export default CheckpointListItem;
