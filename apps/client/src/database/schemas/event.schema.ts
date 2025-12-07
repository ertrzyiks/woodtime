import type { RxJsonSchema } from 'rxdb';

// Constants for schema validation
const MAX_EVENT_ID = 999999999; // Maximum event ID supported by the system

export const eventSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'number',
      minimum: 0,
      maximum: MAX_EVENT_ID
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
      format: 'date-time'
    },
    updated_at: {
      type: 'string',
      format: 'date-time'
    },
    // GraphQL replication fields
    deleted: {
      type: 'boolean',
      default: false
    },
    _modified: {
      type: 'number'
    }
  },
  required: ['id', 'name', 'type', 'checkpoint_count', 'created_at', 'updated_at'],
  indexes: ['created_at', 'updated_at']
};
