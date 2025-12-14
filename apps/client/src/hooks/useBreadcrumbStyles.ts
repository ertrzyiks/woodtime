import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

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
  }),
);
