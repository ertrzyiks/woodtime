import { ReactNode } from 'react';
import {useTranslation} from "react-i18next";
import {Link as RouterLink, useParams} from "react-router-dom";
import {Box, Breadcrumbs, Link, Typography} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import {useMutation, useQuery} from "@apollo/client/react";
import {GetEventDocument} from "../EventPage/data/getEvent";
import {GetFriendsDocument} from "./data/getFriends";
import {InviteToEventDocument} from "./data/invite";
import {useBreadcrumbStyles} from "../../hooks/useBreadcrumbStyles";
import {useInitialNavigation} from "../../hooks/useInitialNavigation";
import ContentLoader from "react-content-loader";
import IconButton from "@mui/material/IconButton";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LoadingIndicator from "../../components/LoadingIndicator/LoadingIndicator";
import Button from "@mui/material/Button";

const Loader = ({ children, width, height } : { width: number, height: number, children: ReactNode }) => (
  <ContentLoader
    speed={2}
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    backgroundColor="#eeeeee"
    foregroundColor="#cccccc"
  >
    {children}
  </ContentLoader>
)

const EventInvitePage = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const classes = useBreadcrumbStyles()
  const isInitialNavigation = useInitialNavigation()

  const { loading, data } = useQuery(GetEventDocument, {
    variables: { id: parseInt(id, 10) },
    fetchPolicy: isInitialNavigation ? 'cache-and-network' : undefined,
    nextFetchPolicy: isInitialNavigation ? 'cache-first' : undefined,
  })

  const { data: friendsData } = useQuery(GetFriendsDocument, {
    fetchPolicy: isInitialNavigation ? 'cache-and-network' : undefined,
    nextFetchPolicy: isInitialNavigation ? 'cache-first' : undefined
  })

  const [invite] = useMutation(InviteToEventDocument)

  if (loading && !data) {
    return (
      <div>
        <Box px={1} py={2}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              color="inherit"
              component={RouterLink}
              to="/"
              className={classes.link}
            >
              <EventIcon className={classes.icon} />
              {t('navigation.events')}
            </Link>
          </Breadcrumbs>
        </Box>

        <Box px={1} py={2}>
          <Loader width={300} height={500}>
            <rect x="0" y="0" rx="3" ry="3" width="45" height="12" />
            <rect x="0" y="20" rx="3" ry="3" width="250" height="3" />
            <rect x="30" y="40" rx="3" ry="3" width="80" height="80" />
            <rect x="130" y="40" rx="3" ry="3" width="80" height="80" />
            <rect x="0" y="190" rx="3" ry="3" width="45" height="12" />
            <rect x="0" y="220" rx="3" ry="3" width="100" height="10" />
            <rect x="0" y="240" rx="3" ry="3" width="100" height="10" />
            <rect x="0" y="260" rx="3" ry="3" width="100" height="10" />

          </Loader>
        </Box>
      </div>
    )
  }

  const event = data?.event

  if (!event) {
    return <div>Not found</div>
  }

  const inviteUrl = `${window.location.protocol}//${window.location.host}/join/${event.id}?token=${event.invite_token}`

  const handleClick = () => {
    try {
      window.navigator.clipboard.writeText(inviteUrl)
    } catch {

    }
  }

  return (
    <div>
      <Box px={1} py={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            component={RouterLink}
            to="/"
            className={classes.link}
          >
            <EventIcon className={classes.icon} />
            {t('navigation.events')}
          </Link>
          <Link
            color="inherit"
            component={RouterLink}
            to={`/events/${event.id}`}
            className={classes.link}
          >
            {event.name}
          </Link>
          <Typography color="textPrimary">Invite</Typography>
        </Breadcrumbs>
      </Box>

      <LoadingIndicator active={loading} />

      <Box>
        <Button onClick={handleClick} startIcon={<PersonAddIcon />}>
          {t('event.actions.invite')}
        </Button>
      </Box>

      <Box p={2}>
        {t('event.actions.inviteFriend')}

        <Box mt={1}>
          {friendsData?.me?.friends.map(friend => (
            <Button key={friend.id} onClick={() => invite({ variables: { eventId: event.id.toString(), friendId: friend.id }})}>
              + {friend.name}
            </Button>
          ))}
        </Box>

      </Box>
    </div>
  )
}

export default EventInvitePage
