import { Checkpoint } from './Checkpoint';

export interface OrienteeringEvent {
  id: number
  name: string
  checkpoint_count: number
  invite_token: string | null
  checkpoints: Checkpoint[]
  participants: {id: number, name: string}[]
  created_at: string
}
