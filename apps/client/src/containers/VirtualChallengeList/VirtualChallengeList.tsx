import { useCallback } from 'react';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import PublicIcon from '@mui/icons-material/Public';

import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import { useBreadcrumbStyles } from '../../hooks/useBreadcrumbStyles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Link } from 'react-router-dom';
import ListItemText from '@mui/material/ListItemText';
import { format } from 'date-fns';
import { useRxQuery } from '../../database/hooks/useRxQuery';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addChallengeButton: {
      position: 'absolute',
      right: '1em',
      bottom: '5em',
    },
  }),
);

const VirtualChallengeList = () => {
  const classes = useStyles();

  const challengesQuery = useCallback((db: any) => {
    if (!db) return null;
    return db.virtualchallenges.find({
      sort: [{ created_at: 'desc' }],
    });
  }, []);

  const { data: challenges, loading } = useRxQuery(challengesQuery);

  const breadcrumbClasses = useBreadcrumbStyles();

  if (loading && (!challenges || challenges.length === 0)) {
    return <div>Loading</div>;
  }

  return (
    <div>
      <Box px={1} py={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <Typography color="textPrimary" className={breadcrumbClasses.link}>
            <PublicIcon className={breadcrumbClasses.icon} />
            Virtual Challenges
          </Typography>
        </Breadcrumbs>
      </Box>

      <LoadingIndicator active={loading} />

      <List>
        {(challenges || []).map((challenge: any) => (
          <ListItem
            key={challenge.id}
            button
            component={Link}
            to={`/virtual-challenges/${challenge.id}`}
          >
            <ListItemText
              primary={challenge.name}
              secondary={format(new Date(challenge.created_at), 'dd/MM/yyyy')}
            />
          </ListItem>
        ))}
      </List>

      <Fab
        className={classes.addChallengeButton}
        color="primary"
        aria-label="add"
        component={Link}
        to="/virtual-challenges/new"
      >
        <AddIcon />
      </Fab>
    </div>
  );
};

export default VirtualChallengeList;
