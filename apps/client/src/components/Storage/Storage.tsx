import React, {ReactNode, useContext, useEffect, useState} from 'react'
import {OrienteeringEvent} from "../../types/OrienteeringEvent"
import {Checkpoint} from "../../types/Checkpoint";

interface Actions {
  addEvent: (name: string) => OrienteeringEvent
  addCheckpoint: (params: { eventId: string, id: string, code?: string, skipped: boolean }) => Checkpoint
}

interface State {
  events: OrienteeringEvent[]
}

export const StorageContext = React.createContext<State>({ events: [] })
export const ActionsContext = React.createContext<Actions|null>(null)

const PersistInLocalstorage = () => {
  const value = useContext(StorageContext)

  useEffect(() => {
    localStorage.setItem('woodtime-storage', JSON.stringify(value))
  }, [value])

  return null
}

const Storage = ({ children }: { children?: ReactNode }) => {
  const [value, setValue] = useState<State>(() => {
    const storedValueRaw =  localStorage.getItem('woodtime-storage') ?? ''
    return storedValueRaw ? JSON.parse(storedValueRaw) : { events: [] as Event[] }
  })

  const actions: Actions = {
    addEvent: (name: string) => {
      const event = {
        id: new Date().getTime().toString(),
        name, createdAt: new Date().toISOString(),
        numberOfCheckpoints: 17,
        checkpoints: []
      }
      const newValue = { events: [...value.events, event] }
      setValue(newValue)
      return event
    },

    addCheckpoint({ eventId, id, code, skipped }) {
      const event = value.events.find(e => e.id === eventId)
      const checkpoint = {
        id,
        skipped,
        code
      }

      if (!event) {
        throw new Error(`Event ${eventId} not found`)
      }

      const newEvents = value.events.map(e => {
        if (e.id === eventId) {
          return { ...e, checkpoints: [...e.checkpoints, checkpoint]}
        } else {
          return e
        }
      })

      setValue({ ...value, events: newEvents})

      return checkpoint
    }
  }

  return (
    <ActionsContext.Provider value={actions}>
      <StorageContext.Provider value={value}>
        <PersistInLocalstorage />
        {children}
      </StorageContext.Provider>
    </ActionsContext.Provider>

  )
}

export default Storage
