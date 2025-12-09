import { useQuery } from '@apollo/client';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import PublicIcon from '@mui/icons-material/Public';

import {GetVirtualChallengesDocument} from "../../queries/getVirtualChallenges";
import LoadingIndicator from "../../components/LoadingIndicator/LoadingIndicator";
import {useBreadcrumbStyles} from "../../hooks/useBreadcrumbStyles";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Link } from 'react-router-dom';
import ListItemText from '@mui/material/ListItemText';
import { format } from 'date-fns';
import {useInitialNavigation} from "../../hooks/useInitialNavigation";
import Fab from "@mui/material/Fab";
import AddIcon from '@mui/icons-material/Add';
import { createStyles, makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addChallengeButton: {
      position: 'absolute',
      right: '1em',
      bottom: '5em',
    },
  })
);

const VirtualChallengeList = () => {
  const isInitialNavigation = useInitialNavigation();
  const classes = useStyles()

  const { data, loading } = useQuery(GetVirtualChallengesDocument, {
    fetchPolicy: isInitialNavigation ? 'cache-and-network' : undefined,
    nextFetchPolicy: isInitialNavigation ? 'cache-first' : undefined,
  })

  const breadcrumbClasses = useBreadcrumbStyles();

  if (!data) {
    return (<div>Loading</div>)
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
        {(data?.virtualChallenges.nodes ?? []).map(challenge => (
          <ListItem key={challenge.id} button component={Link} to={`/virtual-challenges/${challenge.id}`}>
            <ListItemText
              primary={challenge.name}
              secondary={format(new Date(challenge.createdAt), 'dd/MM/yyyy')}
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
  )
}

export default VirtualChallengeList
