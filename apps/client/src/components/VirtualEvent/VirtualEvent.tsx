import React, {useCallback, useState, useEffect} from 'react'
import LinearProgressWithLabel from '../LinearProgressWithLabel/LinearProgressWithLabel'
import {OrienteeringEvent} from "../../types/OrienteeringEvent";
import { Fab } from "@mui/material";
import { makeStyles, createStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

interface VirtualChallenge {
  id: number
}

interface Props {
  event: OrienteeringEvent
  virtualChallenge: VirtualChallenge
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: 20,
    },
    addCheckpointButton: {
      position: 'absolute',
      right: '1em',
      bottom: '1em'
    },
  })
);

function useUserLocation(): [() => void, { loading: boolean, position: GeolocationPosition | null }] {
  const [active, setActive] = useState(false)
  const [position, setPosition] = useState<GeolocationPosition | null>(null)

  useEffect(() => {
    if (!active) {
      return
    }

    let cancelled = false

    const geoSuccess = function(position: GeolocationPosition) {
      if (cancelled) {
        return
      }
      // hideNudgeBanner();
      // clearTimeout(nudgeTimeoutId);

      setActive(false)
      setPosition(position)
    }

    const geoError = function(error: GeolocationPositionError) {
      if (cancelled) {
        return
      }

      setActive(false)

      switch(error.code) {
        case error.TIMEOUT:
          // The user didn't accept the callout
          // showNudgeBanner();
          break;
      }
    }

    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, { enableHighAccuracy: true })

    return () => {
      cancelled = true
    }
  }, [active, setPosition])

  const read = useCallback(() => {
    setActive(true)
  }, [setActive])

  return [read, { position, loading: active }]
}


const VirtualEvent = ({ event, virtualChallenge }: Props) => {
  const { checkpoints } = event

  const classes = useStyles()
  const [readLocation, { position, loading }] = useUserLocation()

  useEffect(() => {
    if (!position) {
      return
    }

    console.log(position)
  }, [position])

  return (
    <div>
      <LinearProgressWithLabel
        current={checkpoints.length}
        max={event.checkpoint_count}
      />

      <Fab
        className={classes.addCheckpointButton}
        color="primary"
        aria-label="add"
        disabled={loading}
        onClick={() => { readLocation() }}
      >
        <AddIcon />
      </Fab>
    </div>
  )

}
export default VirtualEvent
