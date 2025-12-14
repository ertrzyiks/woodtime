import * as React from 'react';
import { Paper, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Checkpoint } from '../../types/Checkpoint';
import { useRxDB } from '../../database/RxDBProvider';
import { generateTempId } from '../../database/utils/generateTempId';

interface Props {
  checkpointNumber: number;
  checkpoint?: Checkpoint;
  eventId: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cell: {
      width: 60,
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      userSelect: 'none',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: theme.shadows[4],
      },
    },
    cellOff: {
      backgroundColor: theme.palette.grey[200],
      color: theme.palette.text.secondary,
    },
    cellOn: {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.success.contrastText,
    },
    cellSkip: {
      backgroundColor: theme.palette.warning.main,
      color: theme.palette.warning.contrastText,
      fontStyle: 'italic',
    },
    number: {
      fontWeight: 'bold',
      fontSize: '1.25rem',
    },
  }),
);

const CheckpointGridCell = ({
  checkpointNumber,
  checkpoint,
  eventId,
}: Props) => {
  const classes = useStyles();
  const { db } = useRxDB();

  // Determine the current state: 'off', 'on', or 'skip'
  const getState = (): 'off' | 'on' | 'skip' => {
    if (!checkpoint) return 'off';
    if (checkpoint.skipped) return 'skip';
    return 'on';
  };

  const state = getState();

  const handleClick = async () => {
    if (!db) return;

    const now = new Date().toISOString();

    if (state === 'off') {
      // Off -> On: Create checkpoint (not skipped)
      await db.checkpoints.insert({
        id: generateTempId(),
        event_id: eventId,
        cp_id: checkpointNumber,
        cp_code: null,
        skipped: false,
        skip_reason: null,
        created_at: now,
        updated_at: now,
      });
    } else if (state === 'on') {
      // On -> Skip: Update checkpoint to skipped
      if (checkpoint) {
        const checkpointDoc = await db.checkpoints
          .findOne({
            selector: { id: checkpoint.id },
          })
          .exec();

        if (checkpointDoc) {
          await checkpointDoc.update({
            $set: {
              skipped: true,
              updated_at: now,
            },
          });
        }
      }
    } else {
      // Skip -> Off: Remove checkpoint
      if (checkpoint) {
        const checkpointDoc = await db.checkpoints
          .findOne({
            selector: { id: checkpoint.id },
          })
          .exec();

        if (checkpointDoc) {
          await checkpointDoc.remove();
        }
      }
    }
  };

  const getCellClass = () => {
    switch (state) {
      case 'on':
        return `${classes.cell} ${classes.cellOn}`;
      case 'skip':
        return `${classes.cell} ${classes.cellSkip}`;
      default:
        return `${classes.cell} ${classes.cellOff}`;
    }
  };

  return (
    <Paper
      className={getCellClass()}
      onClick={handleClick}
      elevation={state === 'off' ? 1 : 3}
    >
      <Typography className={classes.number}>{checkpointNumber}</Typography>
    </Paper>
  );
};

export default CheckpointGridCell;
