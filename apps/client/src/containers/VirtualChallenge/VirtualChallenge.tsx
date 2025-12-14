import { useMutation } from '@apollo/client';
import { useHistory, useParams } from 'react-router-dom';
import { useRxDocument } from '../../database/hooks/useRxDocument';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import PublicIcon from '@mui/icons-material/Public';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useBreadcrumbStyles } from '../../hooks/useBreadcrumbStyles';
import Button from '@mui/material/Button';
import { EnrollVirtualChallengeDocument } from '../../queries/enrollVirtualChallenge';

const VirtualChallenge = () => {
  const breadcrumbClasses = useBreadcrumbStyles();
  const history = useHistory();

  const { id } = useParams<{ id: string }>();
  const { data: virtualChallenge } = useRxDocument(
    'virtualchallenges',
    parseInt(id, 10),
  );

  // NOTE: EnrollVirtualChallenge remains as Apollo mutation since it's a backend-only
  // operation that creates an event from a virtual challenge (not a local data operation)
  const [enroll] = useMutation(EnrollVirtualChallengeDocument, {
    onCompleted: (data) => {
      if (data.enrollVirtualChallenge.event) {
        history.push(`/events/${data.enrollVirtualChallenge.event.id}`);
      }
    },
    variables: {
      id: parseInt(id, 10),
    },
  });

  if (!virtualChallenge) {
    return <div>NOT FOUND</div>;
  }

  return (
    <div>
      <Box px={1} py={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            component={RouterLink}
            to="/virtual-challenges"
            className={breadcrumbClasses.link}
          >
            <PublicIcon className={breadcrumbClasses.icon} />
            Virtual Challenges
          </Link>
          <Typography color="textPrimary">{virtualChallenge.name}</Typography>
        </Breadcrumbs>
      </Box>

      <Button onClick={() => enroll()}>Join</Button>
    </div>
  );
};

export default VirtualChallenge;
