import React from 'react';
import { Checkpoint } from '../../types/Checkpoint';
import {
  Button,
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';

interface Props {
  id: number;
  checkpoint?: Checkpoint;
  eventId: number;
}

const CheckpointListItem = ({ id, checkpoint, eventId }: Props) => {
  const labelId = `checkbox-list-label-${id}`;

  return (
    <ListItem key={id} role={undefined} dense button onClick={handleToggle(p)}>
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={checked.indexOf(p) !== -1}
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-labelledby': labelId }}
        />
      </ListItemIcon>
      <ListItemText id={labelId} primary={p} />
      <Button variant="contained">Skip</Button>
    </ListItem>
  );
};

export default CheckpointListItem;
