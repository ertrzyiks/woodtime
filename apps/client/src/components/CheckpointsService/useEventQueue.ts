import {useContext} from "react";
import {CheckpointsStateContext, Checkpoint} from "./CheckpointsService";


export function useEventQueue(eventId: number): Checkpoint[] {
  const { queue, errored } = useContext(CheckpointsStateContext)

  return [
    ...queue.filter(item => item.eventId === eventId),
    ...errored.filter(item => item.eventId === eventId).map(item => ({...item, checkpoint: { ...item.checkpoint, error: item.error}}))
  ].map(item => item.checkpoint)
}
