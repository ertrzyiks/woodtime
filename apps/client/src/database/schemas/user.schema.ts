import type { RxJsonSchema } from 'rxdb';

const MAX_EVENT_ID = 999999999; // Maximum event ID supported by the system

export const userSchema: RxJsonSchema<any> = {
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
  required: ['id', 'name', 'created_at', 'updated_at'],
  indexes: ['created_at', 'updated_at']
};
