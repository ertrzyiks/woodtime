import { Checkpoint } from './Checkpoint';

export interface OrienteeringEvent {
  id: string;
  name: string;
  numberOfCheckpoints: number;
  checkpoints: Checkpoint[];
  createdAt: string;
}
