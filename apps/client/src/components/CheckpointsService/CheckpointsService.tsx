import React, {Dispatch, ReactNode, useContext, useEffect, useReducer, useState} from 'react'
import {useMutation} from "@apollo/client";
import {CREATE_CHECKPOINT, GET_EVENT} from "../../queries";
import {Snackbar} from "@material-ui/core";

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

export const CheckpointsStateContext = React.createContext<State>({ queue: [], errored: [] })
export const CheckpointsDispatchContext = React.createContext<Dispatch<Action>>(() => {})

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
    }).catch(err => {
      dispatch({
        type: 'errored',
        checkpoint: firstQueueElement.checkpoint,
        eventId: firstQueueElement.eventId,
        error: err
      })
    })
  }, [firstQueueElement, dispatch, createCheckpoint])

  return null
}

export const ErrorReporter = () => {
  const { errored } = useContext(CheckpointsStateContext)
  const [open, setOpen] = useState(true)

  const errors = errored.map(item => `Error during saving point ${item.checkpoint.cpId}`)

  useEffect(() => {
    setOpen(true)
  }, [errored, setOpen])

  if (errors.length === 0) {
    return null
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      onClose={() => setOpen(false)}
      open={open}
      message={errors.map(message => (
        <div>{message}</div>
      ))}
      autoHideDuration={5000}
    />
  )
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
