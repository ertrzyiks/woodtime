import {useContext} from "react";
import {CheckpointsStateContext} from "./CheckpointsService";

export function useEventQueue(eventId: number) {
  const { queue } = useContext(CheckpointsStateContext)

  return queue.filter(item => item.eventId === eventId).map(item => item.checkpoint)
}
