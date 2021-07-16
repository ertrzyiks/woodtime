import {
  createStyles,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Theme,
} from '@material-ui/core';
import React from 'react';

interface Props {
  handleClose: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listWrapper: {
      padding: 10,
    },
  })
);

const SimpleChecklist = (props: Props) => {
  const items: string[] = [
    '4 kanapki',
    'dwa bidony wody',
    'kubek Kuby',
    'jabłko w kawałkach',
    'banan',
    'ciastka',
    'pampersy',
    'chusteczki mokre',
    'worek na śmieci',
    'chusteczki zwykłe',
    'pęseta',
    'octenisept',
    'żel do dezynfekcji',
  ];

  const classes = useStyles();

  return (
    <Dialog
      aria-labelledby="simple-checklist-title"
      open
      onClose={props.handleClose}
    >
      <DialogTitle id="simple-checklist-title">Rzeczy do zabrania</DialogTitle>
      <List className={classes.listWrapper}>
        {items.map((text, ndx: number) => (
          <ListItem key={ndx} dense>
            <ListItemText
              primary={text}
              primaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};

export default SimpleChecklist;
