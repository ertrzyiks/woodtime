import React, {useContext} from 'react'
import {
  useParams
} from "react-router-dom"
import {StorageContext} from "../Storage/Storage";

const EventPage = () => {
  const { id } = useParams<{ id: string }>()
  const { events } = useContext(StorageContext)

  const event = events.find(e => e.id === id)

  if (!event) {
    return null
  }

  return <div>{event.id}</div>
}

export default EventPage
