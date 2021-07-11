import {
  Box,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@material-ui/core';
import React from 'react';

interface Props {
  handleClose: () => void;
}

const SimpleChecklist = (props: Props) => {
  const items: string[] = ['One', 'Two'];

  return (
    <Dialog
      aria-labelledby="simple-checklist-title"
      open
      onClose={props.handleClose}
    >
      <DialogTitle id="simple-checklist-title">Rzeczy do zabrania</DialogTitle>
      <List>
        {items.map((text, ndx: number) => (
          <ListItem key={ndx}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};

export default SimpleChecklist;
