import { useQuery, useMutation } from '@apollo/client';
import React from 'react'
import {useHistory, useParams } from "react-router-dom"
import {GET_VIRTUAL_CHALLENGE} from "../../queries/getVirtualChallenge";
import {useInitialNavigation} from "../../hooks/useInitialNavigation";
import { Link as RouterLink } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import EventIcon from '@material-ui/icons/Event';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import {useBreadcrumbStyles} from "../../hooks/useBreadcrumbStyles";
import Button from '@material-ui/core/Button';
import {ENROLL_VIRTUAL_CHALLENGE} from "../../queries/enrollVirtualChallenge";
import {GET_EVENTS} from "../../queries";

const VirtualChallenge = () => {
  const isInitialNavigation = useInitialNavigation();

  const breadcrumbClasses = useBreadcrumbStyles()
  const history = useHistory();

  const { id } = useParams<{ id: string }>()
  const { data } = useQuery(GET_VIRTUAL_CHALLENGE, {
    fetchPolicy: isInitialNavigation ? 'cache-and-network' : undefined,
    nextFetchPolicy: isInitialNavigation ? 'cache-first' : undefined,
    variables: {
      id: parseInt(id, 10)
    }
  })

  const [enroll] = useMutation(ENROLL_VIRTUAL_CHALLENGE, {
    refetchQueries: [{ query: GET_EVENTS }],
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      history.push(`/events/${data.enrollVirtualChallenge.event.id}`);
    },
    variables: {
      id: parseInt(id, 10)
    }
  })

  const virtualChallenge = data?.virtualChallenge

  if (!virtualChallenge) {
    return <div>NOT FOUND</div>
  }

  return (
    <div>
      <Box px={1} py={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" component={RouterLink} to='/virtual-challenges' className={breadcrumbClasses.link}>
            <EventIcon className={breadcrumbClasses.icon} />
            Virtual Challenges
          </Link>
          <Typography color="textPrimary">{virtualChallenge.name}</Typography>
        </Breadcrumbs>
      </Box>

      <Button onClick={() => enroll()}>Join</Button>
    </div>
  )
}

export default VirtualChallenge
