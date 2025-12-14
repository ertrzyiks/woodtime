import { Fragment, useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import PwaUpdaterContext from '../PwaUpdaterContext/PwaUpdaterContext';

const PwaUpdateNotification = () => {
  const updater = useContext(PwaUpdaterContext);
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!updater) {
      return;
    }

    const handleUpdate = (reg: ServiceWorkerRegistration) => {
      setRegistration(reg);
    };

    updater.onUpdate(handleUpdate);

    return () => {
      updater.offUpdate(handleUpdate);
    };
  }, [updater]);

  const handleClose = () => {
    setRegistration(null);
  };

  const handleReload = () => {
    if (!registration) {
      return;
    }

    setLoading(true);

    const registrationWaiting = registration.waiting;
    if (registrationWaiting) {
      registrationWaiting.postMessage({ type: 'SKIP_WAITING' });
      registrationWaiting.addEventListener('statechange', (e) => {
        const target = e.target ? (e.target as ServiceWorker) : null;
        if (target?.state === 'activated') {
          window.location.reload();
        }
      });
    }
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(registration)}
      onClose={handleClose}
      message="A new version of the app is available!"
      action={
        <Fragment>
          <Button
            color="secondary"
            size="small"
            onClick={handleReload}
            disabled={loading}
          >
            RELOAD
          </Button>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Fragment>
      }
    />
  );
};

export default PwaUpdateNotification;
