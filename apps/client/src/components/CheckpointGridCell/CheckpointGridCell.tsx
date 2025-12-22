import * as React from 'react';
import { Button, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
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
      minWidth: 60,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'scale(1.05)',
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
    },
    number: {
      position: 'absolute',
      top: 4,
      left: 4,
      fontSize: '0.75rem',
      fontWeight: 'bold',
      lineHeight: 1,
    },
    icon: {
      fontSize: '1.5rem',
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

  const getIcon = () => {
    switch (state) {
      case 'on':
        return <CheckCircleIcon className={classes.icon} />;
      case 'skip':
        return <BlockIcon className={classes.icon} />;
      default:
        return null;
    }
  };

  return (
    <Button
      className={getCellClass()}
      onClick={handleClick}
      variant="contained"
      disableElevation
    >
      <Typography className={classes.number}>{checkpointNumber}</Typography>
      {getIcon()}
    </Button>
  );
};

export default CheckpointGridCell;
