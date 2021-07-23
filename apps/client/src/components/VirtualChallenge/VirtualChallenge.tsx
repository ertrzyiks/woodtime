import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import L from 'leaflet'
import { Button, Slider } from '@material-ui/core'
import { useLazyQuery } from '@apollo/client'
import {GET_VIRTUAL_POINTS} from '../../queries/getVirtualPoints'

import oval from '../../assets/oval.png'


const checkpointIcon = L.icon({
  iconUrl: oval,
  shadowUrl: oval,

  iconSize:     [24, 24], // size of the icon
  shadowSize:   [24, 24], // size of the shadow
  iconAnchor:   [12, 12], // point of the icon which will correspond to marker's location
  shadowAnchor: [12, 12],  // the same for the shadow
  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
})

interface Coords {
  lat: number
  lng: number
}

interface Props {
  startPoint: [number, number] | null
  initialPoint: [number, number]
  range: number
  checkpoints?: Coords[]
  onDrag: (coords: Coords) => void
  onClick: (coords: Coords) => void
}

const Map = ({ initialPoint, startPoint, range, checkpoints, onDrag, onClick }: Props) => {
  const mapRef = useRef<L.Map | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const map = L.map('mapid').setView(initialPoint, 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors,',
      maxZoom: 18,
      id: 'osm/streets',
      tileSize: 512,
      zoomOffset: -1
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.off()
      map.remove()
    }
  }, [initialPoint])

  useEffect(() => {
    const map = mapRef.current

    if (!map) {
      return
    }

    const callback = (e: L.LeafletEvent) => {
      // @ts-ignore
      const position = e.latlng
      onClick(position)
    }

    map.on('click', callback)

    return () => {
      map.off('click', callback)
    }
  }, [onClick, mapRef])

  useEffect(() => {
    const map = mapRef.current

    if (!startPoint || !map) {
      return
    }

    const circle = L.circle(startPoint, {
      color: 'red',
      opacity: 0.5,
      fillColor: '#fff',
      fillOpacity: 0.0,
      radius: 500
    }).addTo(map)

    const marker = L.marker(startPoint, { draggable: true })

    marker.on('dragstart', event => {
      setDragging(true)
    })

    marker.on('dragend', event => {
      setDragging(false)
    })

    marker.on('dragend', event => {
      const m = event.target;
      const position = m.getLatLng();

      onDrag(position)
    })

    marker.on('drag', event => {
      const m = event.target;
      const position = m.getLatLng()

      circle.setLatLng(position)
    })

    map.addLayer(marker)

    circleRef.current = circle

    return () => {
      circleRef.current = null
      map.removeLayer(marker)
      map.removeLayer(circle)
    }
  }, [startPoint, mapRef, onDrag])

  useEffect(() => {
    if (!circleRef.current) {
      return
    }

    circleRef.current.setRadius(range)
  }, [range, circleRef])

  useEffect(() => {
    if (!mapRef.current || !circleRef.current || !checkpoints || dragging) {
      return
    }

    const markers = checkpoints?.map(point => {
      return L.marker([point.lat, point.lng], { draggable: true, icon: checkpointIcon })
    }) ?? []

    markers.forEach(marker => mapRef.current?.addLayer(marker))

    return () => {
      markers.forEach(marker => mapRef.current?.removeLayer(marker))
    }
  }, [checkpoints, circleRef, mapRef, dragging])

  return (
    <div id='mapid' style={{ height: '100%' }} />
  )
}

const VirtualChallenge = () => {
  const [getPoints, { loading, data }] = useLazyQuery(GET_VIRTUAL_POINTS, {
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

  return (
    <div style={{ height: '100%' }}>
      <div style={{ height: 200 }}>
        <Slider value={range} onChange={handleChange} min={100} max={2000} aria-labelledby="continuous-slider" />

        <br />
        <Button>Find points</Button>
      </div>
      <div style={{ height: 'calc(100% - 400px)' }}>
        <Map
          initialPoint={initialPoint}
          startPoint={startPoint}
          range={range}
          checkpoints={!loading && data && data.virtualCheckpoints.points.map(({ lat, lng }: {lat: string, lng: string }) => ({
            lat: parseFloat(lat),
            lng: parseFloat(lng)
          }))}
          onDrag={handlePositionDrag}
          onClick={handleMapClick}
        />
      </div>
    </div>
  )
}

export default VirtualChallenge
