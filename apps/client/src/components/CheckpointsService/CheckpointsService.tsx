import React, {Dispatch, ReactNode, useContext, useEffect, useReducer} from 'react'
import {useMutation} from "@apollo/client";
import {CREATE_CHECKPOINT, GET_EVENT} from "../../queries";

interface Checkpoint {
  cpId: number
  cpCode?: string
  skipped: boolean
  skipReason?: string
}

export interface QueueItem {
  checkpoint: Checkpoint
  eventId: number
}

type Action = {
  type: 'add',
  checkpoint: Checkpoint
  eventId: number
} | {
  type: 'delete'
  id: number
  eventId: number
}

interface State {
  queue: QueueItem[]
}

export const CheckpointsStateContext = React.createContext<State>({ queue: [] })
export const CheckpointsDispatchContext = React.createContext<Dispatch<Action>>(() => {})

const reducer = (state: State, action: Action) => {
  switch(action.type) {
    case 'add':
      return { ...state, queue: [...state.queue, { checkpoint: action.checkpoint, eventId: action.eventId}] }
    case 'delete':
      return { ...state, queue: state.queue.filter(item => item.eventId !== action.eventId || item.checkpoint.cpId !== action.id) }
  }
  return state
}

export const Executor = () => {
  const { queue } = useContext(CheckpointsStateContext)
  const dispatch = useContext(CheckpointsDispatchContext)
  const firstQueueElement = queue[0]

  const [createCheckpoint] =
    useMutation(CREATE_CHECKPOINT, {
      awaitRefetchQueries: true,
      onCompleted: (data) => {
        const { cp_id, event_id } = data.createCheckpoint.checkpoint
        dispatch({
          type: 'delete',
          id: cp_id,
          eventId: event_id
        })
      }
    })

  useEffect(() => {
    if (!firstQueueElement) {
      return
    }

    createCheckpoint({
      refetchQueries: [{ query: GET_EVENT, variables: { id: firstQueueElement.eventId } }],
      variables: {
        eventId: firstQueueElement.eventId,
        cpId: firstQueueElement.checkpoint.cpId,
        cpCode: firstQueueElement.checkpoint.cpCode,
        skipped: firstQueueElement.checkpoint.skipped,
        skipReason: firstQueueElement.checkpoint.skipReason
      }
    })
  }, [firstQueueElement, dispatch, createCheckpoint])



  return null
}

const CheckpointsService = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { queue: [] }, initialValue => {
    const value = localStorage.getItem('checkpointsServiceStorage')

    if (!value) {
      return initialValue
    }

    try {
      return JSON.parse(value)
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
