import { useQuery, useMutation } from '@apollo/client';
import {useHistory, useParams } from "react-router-dom"
import {GetVirtualChallengeDocument} from "../../queries/getVirtualChallenge";
import {useInitialNavigation} from "../../hooks/useInitialNavigation";
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import PublicIcon from '@mui/icons-material/Public';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {useBreadcrumbStyles} from "../../hooks/useBreadcrumbStyles";
import Button from '@mui/material/Button';
import {EnrollVirtualChallengeDocument} from "../../queries/enrollVirtualChallenge";
import {GetEventsDocument} from "../../queries/getEvents";

const VirtualChallenge = () => {
  const isInitialNavigation = useInitialNavigation();

  const breadcrumbClasses = useBreadcrumbStyles()
  const history = useHistory();

  const { id } = useParams<{ id: string }>()
  const { data } = useQuery(GetVirtualChallengeDocument, {
    fetchPolicy: isInitialNavigation ? 'cache-and-network' : undefined,
    nextFetchPolicy: isInitialNavigation ? 'cache-first' : undefined,
    variables: {
      id: parseInt(id, 10)
    }
  })

  const [enroll] = useMutation(EnrollVirtualChallengeDocument, {
    refetchQueries: [{ query: GetEventsDocument }],
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      if (data.enrollVirtualChallenge.event) {
        history.push(`/events/${data.enrollVirtualChallenge.event.id}`);
      }
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
            <PublicIcon className={breadcrumbClasses.icon} />
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
