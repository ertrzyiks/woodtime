import { createContext, Dispatch, ReactNode, useEffect, useReducer } from 'react';

export interface Checkpoint {
  cpId: number
  cpCode?: string
  skipped: boolean
  skipReason?: string
  error?: Error
}

export interface QueueItem {
  checkpoint: Checkpoint
  eventId: number
}

export interface ErroredQueueItem extends QueueItem {
  error: Error
}

type Action = {
  type: 'add',
  checkpoint: Checkpoint
  eventId: number
} | {
  type: 'delete'
  id: number
  eventId: number
} | {
  type: 'errored'
  checkpoint: Checkpoint
  eventId: number
  error: Error
}

interface State {
  queue: QueueItem[]
  errored: ErroredQueueItem[]
}

export const CheckpointsStateContext = createContext<State>({ queue: [], errored: [] })
export const CheckpointsDispatchContext = createContext<Dispatch<Action>>(() => {})

const reducer = (state: State, action: Action): State => {
  switch(action.type) {
    case 'add':
      return { ...state, queue: [...state.queue, { checkpoint: action.checkpoint, eventId: action.eventId}] }
    case 'delete':
      return {
        ...state,
        queue: state.queue.filter(item => item.eventId !== action.eventId || item.checkpoint.cpId !== action.id),
        errored: state.errored.filter(item => item.eventId !== action.eventId || item.checkpoint.cpId !== action.id)
      }
    case 'errored':
      return {
        ...state,
        queue: state.queue.filter(item => item.eventId !== action.eventId || item.checkpoint.cpId !== action.checkpoint.cpId),
        errored: [...state.errored, { error: action.error, eventId: action.eventId, checkpoint: { ...action.checkpoint }}]
      }
  }
  return state
}

const CheckpointsService = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { queue: [], errored: [] }, initialValue => {
    const value = localStorage.getItem('checkpointsServiceStorage')

    if (!value) {
      return initialValue
    }

    try {
      const storedValue = JSON.parse(value)

     return { queue: [...storedValue.queue, ...storedValue.errored], errored: [] }
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem('checkpointsServiceStorage', JSON.stringify(state))
  }, [state])

  return (
    <CheckpointsDispatchContext.Provider value={dispatch}>
      <CheckpointsStateContext.Provider value={state}>
          {children}
      </CheckpointsStateContext.Provider>
    </CheckpointsDispatchContext.Provider>

  )
}

export default CheckpointsService
