import type { RxJsonSchema } from 'rxdb';

export const userSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'number',
      minimum: 0,
      maximum: 999999999
    },
    name: {
      type: 'string'
    },
    created_at: {
      type: 'string',
      format: 'date-time'
    },
    updated_at: {
      type: 'string',
      format: 'date-time'
    },
    deleted: {
      type: 'boolean',
      default: false
    },
    _modified: {
      type: 'number'
    }
  },
  required: ['id', 'name', 'created_at', 'updated_at'],
  indexes: ['created_at', 'updated_at', '_modified']
};
