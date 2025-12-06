import type { RxJsonSchema } from 'rxdb';

export const virtualChallengeSchema: RxJsonSchema<any> = {
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
    checkpoints: {
      type: 'object',
      properties: {
        totalCount: {
          type: 'number'
        },
        points: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              lat: {
                type: 'number'
              },
              lng: {
                type: 'number'
              }
            },
            required: ['lat', 'lng']
          }
        }
      }
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
