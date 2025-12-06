import type { RxJsonSchema } from 'rxdb';

export const checkpointSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'number',
      minimum: 0,
      maximum: 999999999
    },
    event_id: {
      type: 'number'
    },
    cp_id: {
      type: 'number'
    },
    cp_code: {
      type: 'string'
    },
    skipped: {
      type: 'boolean'
    },
    skip_reason: {
      type: ['string', 'null']
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
  required: ['id', 'event_id', 'cp_id', 'skipped', 'created_at', 'updated_at'],
  indexes: ['event_id', 'created_at', 'updated_at', '_modified']
};
