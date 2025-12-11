import type { RxJsonSchema } from 'rxdb';
import { ID_MAX_LENGTH } from './constants';

export const eventSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: ID_MAX_LENGTH
    },
    name: {
      type: 'string'
    },
    type: {
      type: 'number'
    },
    invite_token: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    checkpoint_count: {
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
