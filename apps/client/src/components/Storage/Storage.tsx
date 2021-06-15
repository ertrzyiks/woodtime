import React, {ReactNode, useContext, useEffect, useState} from 'react'

interface Checkpoint {
  id: string
  visited: boolean
  code?: string
}

interface Event {
  id: string
  name: string
  numberOfCheckpoints: number
  checkpoints: Checkpoint[]
  createdAt: string
}

interface Actions {
  addEvent: (name: string) => Event
}

export const StorageContext = React.createContext({ events: []  as Event[] })
export const ActionsContext = React.createContext<Actions|null>(null)

const PersistInLocalstorage = () => {
  const value = useContext(StorageContext)

  useEffect(() => {
    localStorage.setItem('woodtime-storage', JSON.stringify(value))
  }, [value])

  return null
}

const Storage = ({ children }: { children?: ReactNode }) => {
  const [value, setValue] = useState(() => {
    const storedValueRaw =  localStorage.getItem('woodtime-storage') ?? ''
    return storedValueRaw ? JSON.parse(storedValueRaw) : { events: [] as Event[] }
  })

  const actions = {
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
