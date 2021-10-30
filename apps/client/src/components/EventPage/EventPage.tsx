import React, { ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import { useParams, Link as RouterLink } from 'react-router-dom';
import ContentLoader from "react-content-loader"
import ScoreLauf from '../ScoreLauf/ScoreLauf';
import VirtualEvent from '../VirtualEvent/VirtualEvent';
import { GetEventDocument } from '../../queries/event';
import { useInitialNavigation } from '../../hooks/useInitialNavigation';
import { Box, Breadcrumbs, Link, Typography } from '@material-ui/core';
import EventIcon from '@material-ui/icons/Event';
import { useBreadcrumbStyles } from '../../hooks/useBreadcrumbStyles';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import Classic from '../Classic/Classic';
import {useEventQueue} from "../CheckpointsService/useEventQueue";
import {QueueItem} from "../CheckpointsService/CheckpointsService";
import {useTranslation} from "react-i18next";

const EVENT_TYPES = {
  SCORE: 1,
  CLASSIC: 2,
};

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

function mergeCheckpoints(event: any, items: QueueItem['checkpoint'][]) {
  if (!event) {
    return event
  }

  return {
    ...event,
    checkpoints: [
      ...event.checkpoints,
      ...items.map(item => ({
        id: 0,
        cp_id: item.cpId,
        cp_code: item.cpCode,
        skipped: item.skipped,
        skip_reason: item.skipReason,
        pending: true,
        error: item.error
      }))
    ]
  }
}

const EventPage = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>();
  const items = useEventQueue(parseInt(id, 10))

  const classes = useBreadcrumbStyles();
  const isInitialNavigation = useInitialNavigation();

  const { loading, error, data } = useQuery(GetEventDocument, {
    variables: { id: parseInt(id, 10) },
    fetchPolicy: isInitialNavigation ? 'cache-and-network' : undefined,
    nextFetchPolicy: isInitialNavigation ? 'cache-first' : undefined,
  });

  const event = mergeCheckpoints(data?.event, items)

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

  const eventContent =
    event.type === EVENT_TYPES.SCORE ? (
      <ScoreLauf
        event={event}
        newCheckpointPath={`/events/${event.id}/add-checkpoint`}
      />
    ) : (
      <Classic event={event} />
    );

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
          <Typography color="textPrimary">{event.name}</Typography>
        </Breadcrumbs>
      </Box>

      <LoadingIndicator active={loading} />

      {error && <p>Error :(</p>}

      {(event.type === 3 && event.virtual_challenge) ? (
        <VirtualEvent
          event={event}
          virtualChallenge={event.virtual_challenge}
          newCheckpointPath={`/events/${event.id}/add-checkpoint`}
        />
      ) : eventContent}
    </div>
  );
};

export default EventPage;
