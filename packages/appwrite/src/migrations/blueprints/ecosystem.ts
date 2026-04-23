import { asTableId } from '@repo/appwrite-core';
import type { TableBlueprint } from '../blueprints.js';

export const ecosystemBlueprints: TableBlueprint[] = [
  {
    id: asTableId('solutions'),
    name: 'Solutions',
    uniqueLogicKeys: {
      byLocaleTitle: ['title', 'locale'],
    },
    columns: [
      { key: 'title', type: 'string', required: true, size: 128 },
      { key: 'description', type: 'string', required: true, size: 1024 },
      { key: 'iconCode', type: 'string', required: true, size: 64 },
      { key: 'sort', type: 'integer', required: true, default: 0 },
      { key: 'locale', type: 'enum', required: true, elements: ['en', 'pt'] },
    ],
    indexes: [
      { key: 'idx_locale', type: 'key', attributes: ['locale'] },
      { key: 'idx_sort', type: 'key', attributes: ['sort'] },
    ],
  },
  {
    id: asTableId('skills'),
    name: 'Skills',
    uniqueLogicKeys: {
      byTypeTitle: ['title', 'type'],
    },
    columns: [
      { key: 'title', type: 'string', required: true, size: 64 },
      {
        key: 'type',
        type: 'enum',
        required: true,
        elements: ['frontend', 'backend', 'fullstack'],
      },
      { key: 'iconCode', type: 'string', required: true, size: 64 },
      {
        key: 'status',
        type: 'enum',
        required: true,
        elements: ['active', 'archived'],
      },
      { key: 'sort', type: 'integer', required: true, default: 0 },
    ],
    indexes: [
      { key: 'idx_type', type: 'key', attributes: ['type'] },
      { key: 'idx_status', type: 'key', attributes: ['status'] },
      { key: 'idx_sort', type: 'key', attributes: ['sort'] },
    ],
  },
];
