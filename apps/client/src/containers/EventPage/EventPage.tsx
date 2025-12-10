import { ReactNode, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import ContentLoader from "react-content-loader"
import ScoreLauf from './components/ScoreLauf/ScoreLauf';
import VirtualEvent from '../../components/VirtualEvent/VirtualEvent';
import { useRxDocument } from '../../database/hooks/useRxDocument';
import { useRxQuery } from '../../database/hooks/useRxQuery';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import { useBreadcrumbStyles } from '../../hooks/useBreadcrumbStyles';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import Classic from './components/Classic/Classic';
import {useEventQueue} from "../../components/CheckpointsService/useEventQueue";
import {QueueItem} from "../../components/CheckpointsService/CheckpointsService";
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

function mergeCheckpoints(event: any, checkpoints: any[], items: QueueItem['checkpoint'][]) {
  if (!event) {
    return event
  }

  return {
    ...event,
    checkpoints: [
      ...checkpoints,
      ...items.map(item => ({
        id: 0,
        cp_id: item.cpId,
        cp_code: item.cpCode ?? null,
        event_id: event.id,
        skipped: item.skipped,
        skip_reason: item.skipReason ?? null,
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

  const { data: eventData, loading: eventLoading, error: eventError } = useRxDocument('events', parseInt(id, 10));
  
  const checkpointsQuery = useCallback(
    (db: any) => {
      if (!db) return null;
      return db.checkpoints.find({
        selector: {
          event_id: parseInt(id, 10),
          deleted: false
        },
        sort: [{ cp_id: 'asc' }]
      });
    },
    [id]
  );
  
  const { data: checkpoints, loading: checkpointsLoading } = useRxQuery(checkpointsQuery);

  const loading = eventLoading || checkpointsLoading;
  const error = eventError;
  const event = mergeCheckpoints(eventData, checkpoints, items)

  if (loading && !eventData) {
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

  if (!event) {
    return <div>Not found</div>
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
        />
      ) : eventContent}
    </div>
  );
};

export default EventPage;
