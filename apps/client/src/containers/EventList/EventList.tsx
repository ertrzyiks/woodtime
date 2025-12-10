import {
  Box,
  Breadcrumbs,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import EventIcon from '@mui/icons-material/Event';
import ListIcon from '@mui/icons-material/List';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';
import { useRxQuery } from '../../database/hooks/useRxQuery';
import { useRxDB } from '../../database/RxDBProvider';
import { useCallback } from 'react';
import SimpleChecklist from '../../components/SimpleChecklist/SimpleChecklist';
import { useState } from 'react';
import { useBreadcrumbStyles } from '../../hooks/useBreadcrumbStyles';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import {useTranslation} from "react-i18next";

const Event = ({
  id,
  name,
  createdAt,
}: {
  id: number;
  name: string;
  createdAt: string;
}) => (
  <ListItem button component={Link} to={`/events/${id}`}>
    <ListItemText
      primary={name}
      secondary={format(new Date(createdAt), 'dd/MM/yyyy')}
    />
  </ListItem>
);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      display: 'flex',
      width: '100%',
    },
    deleteIcon: {},
    icons: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    listWrapper: {},
    addEventButton: {
      position: 'fixed',
      right: '1em',
      bottom: '5em',
    },
  })
);

const EventList = () => {
  const { t } = useTranslation()
  const { db } = useRxDB();
  
  // Memoize query constructor to prevent unnecessary re-subscriptions
  const eventsQuery = useCallback(
    (db: any) => {
      if (!db) return null;
      return db.events.find({
        selector: {
          deleted: false
        },
        sort: [{ created_at: 'desc' }]
      });
    },
    []
  );
  
  const { data: events, loading, error } = useRxQuery(eventsQuery);
  const [showChecklist, setShowChecklist] = useState(false);

  const handleChecklistClick = () => {
    setShowChecklist(true);
  };

  const handleChecklistClose = () => {
    setShowChecklist(false);
  };

  const handleDeleteClick = async (eventId: number) => {
    if (!db) return;
    
    const event = await db.events.findOne({
      selector: { id: eventId }
    }).exec();
    
    if (event) {
      // Soft delete - will be synced via replication
      await event.update({
        $set: {
          deleted: true,
          _modified: Date.now()
        }
      });
    }
  };

  const classes = useStyles();
  const breadcrumbClasses = useBreadcrumbStyles();

  if (loading && events.length === 0) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error :( {error.toString()}</p>;
  }

  return (
    <div className={classes.listWrapper}>
      <Box px={1} py={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <Typography color="textPrimary" className={breadcrumbClasses.link}>
            <EventIcon className={breadcrumbClasses.icon} />
            {t('navigation.events')}
          </Typography>
        </Breadcrumbs>
      </Box>

      <LoadingIndicator active={loading} />

      {error && <p>Error :(</p>}

      <List>
        {[...events]
          .sort((a: any, b: any) => b.id - a.id)
          .map((event: any) => (
              <div className={classes.wrapper} key={event.id}>
                <Event id={event.id} name={event.name} createdAt={event.created_at} />
                <div className={classes.icons}>
                  <IconButton
                    aria-label="checklist"
                    onClick={() => handleChecklistClick()}
                  >
                    <ListIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={() => handleDeleteClick(event.id)}
                  >
                    <ClearIcon />
                  </IconButton>
                </div>
              </div>
            )
          )}
      </List>

      {showChecklist && <SimpleChecklist handleClose={handleChecklistClose} />}
      <Fab
        className={classes.addEventButton}
        color="primary"
        aria-label="add"
        component={Link}
        to="/events/new"
      >
        <AddIcon />
      </Fab>
    </div>
  );
};

export default EventList;
