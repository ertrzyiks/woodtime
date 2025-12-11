import type { RxJsonSchema } from 'rxdb';

// Constants for schema validation
const MAX_EVENT_ID = 999999999; // Maximum event ID supported by the system

export const eventSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: MAX_EVENT_ID.toString().length
    },
    name: {
      type: 'string'
    },
    type: {
      type: 'number'
    },
    invite_token: {
      type: 'string'
    },
    checkpoint_count: {
      type: 'number'
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
  required: ['id', 'name', 'type', 'checkpoint_count', 'created_at', 'updated_at'],
  indexes: ['created_at', 'updated_at']
};
