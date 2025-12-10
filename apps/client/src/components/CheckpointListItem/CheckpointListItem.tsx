import * as React from 'react';
import { Checkpoint } from '../../types/Checkpoint';
import {
  Button,
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { useHistory } from 'react-router-dom';
import { useRxDB } from '../../database/RxDBProvider';
import { generateTempId } from '../../database/utils/generateTempId';

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
  const [creationLoading, setCreationLoading] = React.useState(false);
  const [creationError, setCreationError] = React.useState<Error | null>(null);

  const history = useHistory();
  const { db } = useRxDB();

  const handleToggle = async (value: number) => {
    if (!db) return;
    
    setCreationLoading(true);
    setCreationError(null);
    
    try {
      if (checkpoint) {
        // Delete checkpoint (soft delete)
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
      } else {
        // Create checkpoint
        const now = new Date().toISOString();
        await db.checkpoints.insert({
          id: generateTempId(),
          event_id: eventId,
          cp_id: value,
          cp_code: null,
          skipped: false,
          skip_reason: null,
          created_at: now,
          updated_at: now,
          deleted: false,
          _modified: Date.now()
        });
        
        history.push(`/events/${eventId}`);
      }
      setCreationLoading(false);
    } catch (err) {
      setCreationError(err as Error);
      setCreationLoading(false);
      throw err;
    }
  };

  const handleSkipClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    checkpointId: number
  ) => {
    e.stopPropagation();
    
    if (!db) return;
    
    setCreationLoading(true);
    setCreationError(null);

    try {
      const now = new Date().toISOString();
      await db.checkpoints.insert({
        id: generateTempId(),
        event_id: eventId,
        cp_id: checkpointId,
        cp_code: null,
        skipped: true,
        skip_reason: null,
        created_at: now,
        updated_at: now,
        deleted: false,
        _modified: Date.now()
      });
      
      history.push(`/events/${eventId}`);
      setCreationLoading(false);
    } catch (err) {
      setCreationError(err as Error);
      setCreationLoading(false);
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
