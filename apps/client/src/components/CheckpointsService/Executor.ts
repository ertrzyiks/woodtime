import {CheckpointsDispatchContext, CheckpointsStateContext} from "./CheckpointsService";
import {useContext, useEffect} from "react";
import {useRxDB} from "../../database/RxDBProvider";
import {generateTempId} from "../../database/utils/generateTempId";

const Executor = () => {
  const { queue } = useContext(CheckpointsStateContext)
  const dispatch = useContext(CheckpointsDispatchContext)
  const { db } = useRxDB()
  const firstQueueElement = queue[0]

  useEffect(() => {
    if (!firstQueueElement || !db) {
      return
    }

    const createCheckpoint = async () => {
      try {
        const now = new Date().toISOString();
        const checkpoint = {
          id: generateTempId(),
          event_id: firstQueueElement.eventId,
          cp_id: firstQueueElement.checkpoint.cpId,
          cp_code: firstQueueElement.checkpoint.cpCode ?? null,
          skipped: firstQueueElement.checkpoint.skipped,
          skip_reason: firstQueueElement.checkpoint.skipReason ?? null,
          created_at: now,
          updated_at: now,
          deleted: false,
          _modified: Date.now()
        };
        
        await db.checkpoints.insert(checkpoint);
        
        // Remove from queue on success
        dispatch({
          type: 'delete',
          id: firstQueueElement.checkpoint.cpId,
          eventId: firstQueueElement.eventId
        })
      } catch (err) {
        dispatch({
          type: 'errored',
          checkpoint: firstQueueElement.checkpoint,
          eventId: firstQueueElement.eventId,
          error: err
        })
      }
    };

    createCheckpoint();
  }, [firstQueueElement, dispatch, db])

  return null
}

export default Executor
