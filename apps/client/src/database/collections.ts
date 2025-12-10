import { eventSchema } from './schemas/event.schema';
import { checkpointSchema } from './schemas/checkpoint.schema';
import { userSchema } from './schemas/user.schema';
import { virtualChallengeSchema } from './schemas/virtualChallenge.schema';
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
  deleted: boolean;
  _modified: number;
};

type EventDocument = RxDocument<EventDocType>;
type EventCollection = RxCollection<EventDocType>;

// Middleware to automatically set _modified timestamp
const addModifiedTimestamp = {
  preInsert: function(this: any, docData: any) {
    docData._modified = Date.now();
  },
  preSave: function(this: any, docData: any) {
    docData._modified = Date.now();
  }
};

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
          selector: {
            deleted: false
          },
          sort: [{ created_at: 'desc' }]
        });
      }
    },
    migrationStrategies: {},
    ...addModifiedTimestamp
  },
  checkpoints: {
    schema: checkpointSchema,
    migrationStrategies: {},
    ...addModifiedTimestamp
  },
  users: {
    schema: userSchema,
    migrationStrategies: {},
    ...addModifiedTimestamp
  },
  virtualchallenges: {
    schema: virtualChallengeSchema,
    migrationStrategies: {},
    ...addModifiedTimestamp
  }
};
