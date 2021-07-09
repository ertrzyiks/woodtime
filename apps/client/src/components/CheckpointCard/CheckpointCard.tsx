import {
  createStyles,
  IconButton,
  Theme,
  makeStyles,
  Typography,
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import React from 'react';
import { Checkpoint } from '../../types/Checkpoint';
import { useMutation } from '@apollo/client';
import { DELETE_CHECKPOINT } from '../../queries/deleteCheckpoint';

interface Props {
  checkpoint: Checkpoint;
  eventId: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      width: '100%',
    },
    header: {
      padding: 10,
      paddingBottom: 2,
      backgroundColor: '#c5cae9',
    },
    content: {
      border: '1px solid #c5cae9',

      width: '100%',
      paddingLeft: 10,
      paddingRight: 10,
      paddingBottom: 10,
      padding: 10,
      boxSizing: 'border-box',
    },
    deleteIcon: {
      position: 'absolute',
      top: -3,
      right: -5,
    },
  })
);

const CheckpointCard = ({ checkpoint }: Props) => {
  const [deleteCheckpoint] = useMutation(DELETE_CHECKPOINT, {
    refetchQueries: ['getEvent'],
    awaitRefetchQueries: true,
  });

  const handleDeleteClick = (checkpointId: number) => {
    return deleteCheckpoint({ variables: { id: checkpointId } });
  };

  const classes = useStyles();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
      }}
    >
      <div className={classes.wrapper}>
        <div className={classes.header}>
          <Typography variant="button" color="textSecondary">
            {checkpoint.cp_id}
          </Typography>
        </div>
        <div className={classes.content}>
          <Typography variant="subtitle1">
            <span>
              {checkpoint.skipped
                ? 'skipped'
                : checkpoint.cp_code?.toUpperCase()}
            </span>
          </Typography>
        </div>
      </div>
      <div className={classes.deleteIcon}>
        <IconButton
          aria-label="delete"
          onClick={() => handleDeleteClick(checkpoint.id)}
        >
          <ClearIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default CheckpointCard;
