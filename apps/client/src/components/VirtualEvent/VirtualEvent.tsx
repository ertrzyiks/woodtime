import React from 'react'
import LinearProgressWithLabel from '../LinearProgressWithLabel/LinearProgressWithLabel'
import {OrienteeringEvent} from "../../types/OrienteeringEvent";

interface VirtualChallenge {
  id: number
}

interface Props {
  event: OrienteeringEvent
  newCheckpointPath: string
  virtualChallenge: VirtualChallenge
}

const VirtualEvent = ({ event, virtualChallenge, newCheckpointPath }: Props) => {
  const { checkpoints } = event

  return (
    <div>
      <LinearProgressWithLabel
        current={checkpoints.length}
        max={event.checkpoint_count}
      />
    </div>
  )

}
export default VirtualEvent
