import { Checkpoint } from './Checkpoint';

export interface OrienteeringEvent {
  id: number;
  name: string;
  checkpoint_count: number;
  checkpoints: Checkpoint[];
  created_at: string;
}
