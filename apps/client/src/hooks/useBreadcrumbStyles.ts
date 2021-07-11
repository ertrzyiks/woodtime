import {
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core';

export const useBreadcrumbStyles = makeStyles((theme: Theme) =>
  createStyles({
    link: {
      display: 'flex',
    },
    icon: {
      marginRight: theme.spacing(0.5),
      width: 20,
      height: 20,
    },
  })
);
