import type { RxJsonSchema } from 'rxdb';
import { ID_MAX_LENGTH } from './constants';

export const participantSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: ID_MAX_LENGTH,
    },
    user_id: {
      type: 'string',
      maxLength: ID_MAX_LENGTH,
    },
    event_id: {
      type: 'string',
      maxLength: ID_MAX_LENGTH,
    },
    created_at: {
      type: 'string',
      format: 'date-time',
      maxLength: 24,
    },
    updated_at: {
      type: 'string',
      format: 'date-time',
      maxLength: 24,
    },
  },
  required: ['id', 'user_id', 'event_id', 'created_at', 'updated_at'],
  indexes: ['user_id', 'event_id', 'created_at', 'updated_at'],
};
