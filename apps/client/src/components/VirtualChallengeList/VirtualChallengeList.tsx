import { useQuery } from '@apollo/client';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import EventIcon from '@material-ui/icons/Event';

import React from 'react'
import {GET_VIRTUAL_CHALLENGES} from "../../queries/getVirtualChallenges";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import {useBreadcrumbStyles} from "../../hooks/useBreadcrumbStyles";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Link } from 'react-router-dom';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import { format } from 'date-fns';
import {useInitialNavigation} from "../../hooks/useInitialNavigation";

const VirtualChallengeList = () => {
  const isInitialNavigation = useInitialNavigation();

  const { data, loading } = useQuery(GET_VIRTUAL_CHALLENGES, {
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
            <EventIcon className={breadcrumbClasses.icon} />
            Virtual Challenges
          </Typography>
        </Breadcrumbs>
      </Box>

      <LoadingIndicator active={loading} />

      <List>
        {data.virtualChallenges.nodes.map((challenge: any) => (
          <ListItem button component={Link} to={`/virtual-challenges/${challenge.id}`}>
            <ListItemText
              primary={challenge.name}
              secondary={format(new Date(challenge.createdAt), 'dd/MM/yyyy')}
            />
          </ListItem>
        ))}
      </List>

    </div>
  )
}

export default VirtualChallengeList
