import { eventSchema } from './schemas/event.schema';
import { checkpointSchema } from './schemas/checkpoint.schema';
import { userSchema } from './schemas/user.schema';
import { virtualChallengeSchema } from './schemas/virtualChallenge.schema';
import { participantSchema } from './schemas/participant.schema';
import type { RxDocument, RxCollection, RxQuery } from 'rxdb';

// Define document types for proper typing
type EventDocType = {
  id: number;
  name: string;
  type: number;
  invite_token?: string;
  checkpoint_count: number;
  created_at: string;
  updated_at: string;
};

type EventDocument = RxDocument<EventDocType>;
type EventCollection = RxCollection<EventDocType>;

export const collections = {
  events: {
    schema: eventSchema,
    methods: {
      // Instance methods
      getCheckpoints(this: EventDocument): Promise<any[]> {
        return this.collection.database.checkpoints
          .find({ selector: { event_id: this.id } })
          .exec();
      }
    },
    statics: {
      // Static methods
      getUpcoming(this: EventCollection): RxQuery<EventDocType, any> {
        return this.find({
          sort: [{ created_at: 'desc' }]
        });
      }
    },
    migrationStrategies: {},
  },
  checkpoints: {
    schema: checkpointSchema,
    migrationStrategies: {},
  },
  users: {
    schema: userSchema,
    migrationStrategies: {},
  },
  virtualchallenges: {
    schema: virtualChallengeSchema,
    migrationStrategies: {},
  },
  participants: {
    schema: participantSchema,
    migrationStrategies: {},
  }
};
