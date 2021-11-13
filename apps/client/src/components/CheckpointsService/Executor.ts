import {CheckpointsDispatchContext, CheckpointsStateContext} from "./CheckpointsService";
import {useContext, useEffect} from "react";
import {useMutation} from "@apollo/client";
import {CreateCheckpointDocument} from "../../queries/createCheckpoint";
import {GetEventDocument} from "../../containers/EventPage/data/getEvent";

const Executor = () => {
  const { queue } = useContext(CheckpointsStateContext)
  const dispatch = useContext(CheckpointsDispatchContext)
  const firstQueueElement = queue[0]

  const [createCheckpoint] =
    useMutation(CreateCheckpointDocument, {
      awaitRefetchQueries: true,
      onCompleted: (data) => {
        if (!data.createCheckpoint.checkpoint) {
          return
        }

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
      refetchQueries: [{ query: GetEventDocument, variables: { id: firstQueueElement.eventId } }],
      variables: {
        eventId: firstQueueElement.eventId,
        cpId: firstQueueElement.checkpoint.cpId,
        cpCode: firstQueueElement.checkpoint.cpCode ?? null,
        skipped: firstQueueElement.checkpoint.skipped,
        skipReason: firstQueueElement.checkpoint.skipReason ?? null
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

export default Executor
