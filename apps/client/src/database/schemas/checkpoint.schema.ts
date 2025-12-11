import type { RxJsonSchema } from 'rxdb';

const MAX_EVENT_ID = 999999999; // Maximum event ID supported by the system
export const checkpointSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: MAX_EVENT_ID.toString().length
    },
    event_id: {
      type: 'string',
      maxLength: MAX_EVENT_ID.toString().length
    },
    cp_id: {
      type: 'number'
    },
    cp_code: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    skipped: {
      type: 'boolean'
    },
    skip_reason: {
      type: ['string', 'null']
    },
    created_at: {
      type: 'string',
      format: 'date-time',
      maxLength: 24
    },
    updated_at: {
      type: 'string',
      format: 'date-time',
      maxLength: 24
    },
  },
  required: ['id', 'event_id', 'cp_id', 'skipped', 'created_at', 'updated_at'],
  indexes: ['event_id', 'created_at', 'updated_at']
};
