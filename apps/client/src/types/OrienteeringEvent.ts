import { Checkpoint } from './Checkpoint';

export interface OrienteeringEvent {
  id: number;
  name: string;
  numberOfCheckpoints: number;
  checkpoints: Checkpoint[];
  createdAt: string;
}
