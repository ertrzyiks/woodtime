import React, {useContext, useEffect, useState} from 'react'
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import PwaUpdaterContext from "../PwaUpdaterContext/PwaUpdaterContext";

const PwaUpdateNotification = () => {
  const updater = useContext(PwaUpdaterContext)
  const [loading, setLoading] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration|null>(null)

  useEffect(() => {
    if (!updater) {
      return
    }

    const handleUpdate = (reg: ServiceWorkerRegistration) => {
      setRegistration(reg)
    }

    updater.onUpdate(handleUpdate)

    return () => {
      updater.offUpdate(handleUpdate)
    }
  }, [updater])


  const handleClose = () => {
    setRegistration(null)
  }

  const handleReload = () => {
    if (!registration) {
      return
    }

    setLoading(true)

    const registrationWaiting = registration.waiting;
    if (registrationWaiting) {
      registrationWaiting.postMessage({ type: 'SKIP_WAITING' });
      registrationWaiting.addEventListener('statechange', (e) => {
        const target = e.target ? e.target as ServiceWorker : null
        if (target?.state === 'activated') {
          window.location.reload()
        }
      });
    }
  }

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
        <React.Fragment>
          <Button color="secondary" size="small" onClick={handleReload} disabled={loading}>
            RELOAD
          </Button>
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      }
    />
  )
}

export default PwaUpdateNotification
