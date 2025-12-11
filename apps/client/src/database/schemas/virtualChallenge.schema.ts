import type { RxJsonSchema } from 'rxdb';
import { ID_MAX_LENGTH } from './constants';

export const virtualChallengeSchema: RxJsonSchema<any> = {
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
    checkpoints: {
      type: 'string'
    },
  //   checkpoints: {
  //     type: 'object',
  //     properties: {
  //       totalCount: {
  //         type: 'number'
  //       },
  //       points: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             lat: {
  //               type: 'number'
  //             },
  //             lng: {
  //               type: 'number'
  //             }
  //           },
  //           required: ['lat', 'lng']
  //         }
  //       }
  //     }
  //   },
  },
  required: ['id', 'name', 'created_at', 'updated_at'],
  indexes: ['created_at', 'updated_at']
};
