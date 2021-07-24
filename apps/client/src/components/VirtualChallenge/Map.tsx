import React, { useRef, useEffect, useState } from 'react'
import * as L from 'leaflet'

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
  onChange: (points: Coords[]) => void
}

const Map = ({ initialPoint, startPoint, range, checkpoints, onDrag, onClick, onChange }: Props) => {
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
      fillOpacity: 0.2,
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

  // useEffect(() => {
  //   if (checkpoints) {
  //     console.log(checkpoints)
  //     onChange(checkpoints)
  //   }
  // }, [checkpoints, onChange])

  useEffect(() => {
    if (!mapRef.current || !circleRef.current || !checkpoints || dragging) {
      return
    }

    const markers = checkpoints?.map((point, index) => {
      return L.marker([point.lat, point.lng], { draggable: true, icon: checkpointIcon }).bindTooltip(`${index + 1}`, { permanent: true, interactive: false, className: 'checkpoint-label', direction: 'right' })
    }) ?? []

    markers.forEach(marker => mapRef.current?.addLayer(marker))
    markers.forEach(marker => {
      marker.on('dragend', (e) => {
        const newCheckPoints = markers.map(m => m.getLatLng())
        onChange(newCheckPoints)
      })
    })

    return () => {
      markers.forEach(marker => mapRef.current?.removeLayer(marker))
    }
  }, [checkpoints, circleRef, mapRef, dragging, onChange])

  return (
    <div id='mapid' style={{ height: '100%' }} />
  )
}

export default Map
