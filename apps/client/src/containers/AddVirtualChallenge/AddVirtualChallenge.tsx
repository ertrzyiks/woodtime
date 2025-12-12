import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Slider } from '@mui/material'
import { useLazyQuery } from '@apollo/client'

import Map from './Map'
import { GetVirtualPointsDocument } from '../../queries/getVirtualPoints'
import { useRxDB } from '../../database/RxDBProvider'
import { generateTempId } from '../../database/utils/generateTempId';

interface Coords {
  lat: number
  lng: number
}

const AddVirtualChallenge = () => {
  const [points, setPoints] = useState<Coords[]>([])
  const { db } = useRxDB()
  
  // NOTE: getVirtualPoints remains as Apollo query since it's a backend-only
  // operation that generates random nearby points (not stored in local DB)
  const [getPoints, { loading, data }] = useLazyQuery(GetVirtualPointsDocument, {
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true
  })

  const [startPoint, setStartPoint] = useState<[number, number] | null>(null)
  const initialPoint: [number, number] = useMemo(() => [54.372158, 18.638306], [])
  const [range, setRange] = useState(500)


  const handleChange = (event: unknown, newValue: number | number[]) => {
    setRange(Array.isArray(newValue) ? newValue[0] : newValue)
  }

  const handlePositionDrag = useCallback((coords) => {
    setStartPoint([coords.lat, coords.lng])
  }, [setStartPoint])

  const hasPoint = startPoint !== null

  const handleMapClick = useCallback((coords) => {
    if (hasPoint) {
      return
    }

    setStartPoint([coords.lat, coords.lng])
  }, [hasPoint, setStartPoint])

  const handlePointsChange = useCallback((points: Coords[]) => {
    setPoints(points)
  }, [setPoints])

  const handleCreate = useCallback(async () => {
    if (!db) return;
    
    const now = new Date().toISOString();
    // TODO: Replace hardcoded name with user input from a form field
    await db.virtualchallenges.insert({
      id: generateTempId(),
      name: 'Test',
      created_at: now,
      updated_at: now,
      checkpoints: {
        totalCount: points.length,
        points: points.map(point => ({ lat: point.lat, lng: point.lng }))
      },
      deleted: false
    });
  }, [points, db])

  useEffect(() => {
    if (!startPoint) {
      return
    }

    getPoints({
      variables: {
        input: {
          start: {
            lat: startPoint[0].toString(),
            lng: startPoint[1].toString()
          },
          radius: range,
          count: 12
        }
      }
    })
  }, [getPoints, range, startPoint])

  useEffect(() => {
    if (!loading && data) {
      setPoints(data.pointsNearby.points.map(({ lat, lng }: {lat: string, lng: string }) => ({
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      })))
    } else {
      setPoints([])
    }
  }, [loading, data])

  return (
    <div>
      <div style={{ height: 200 }}>
        <Slider value={range} onChange={handleChange} min={100} max={2000} aria-labelledby="continuous-slider" />

        <br />
        <Button onClick={handleCreate}>Create</Button>
      </div>
      <div style={{ position: 'fixed', bottom: 12, left: 12, right: 12, top: 300 }}>
        <Map
          initialPoint={initialPoint}
          startPoint={startPoint}
          range={range}
          checkpoints={points}
          onDrag={handlePositionDrag}
          onClick={handleMapClick}
          onChange={handlePointsChange}
        />
      </div>
    </div>
  )
}

export default AddVirtualChallenge
