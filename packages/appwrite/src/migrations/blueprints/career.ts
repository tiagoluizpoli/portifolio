import { asTableId } from '@repo/appwrite-core';
import type { TableBlueprint } from '../blueprints.js';

export const careerBlueprints: TableBlueprint[] = [
  {
    id: asTableId('educations'),
    name: 'Educations',
    uniqueLogicKeys: {
      byLocaleTitleOrganization: ['title', 'organization', 'locale'],
    },
    columns: [
      { key: 'title', type: 'string', required: true, size: 128 },
      { key: 'organization', type: 'string', required: true, size: 128 },
      { key: 'location', type: 'string', required: true, size: 128 },
      { key: 'period', type: 'string', required: true, size: 64 },
      { key: 'description', type: 'string', required: true, size: 2048 },
      { key: 'current', type: 'boolean', required: true, default: false },
      { key: 'sort', type: 'integer', required: true, default: 0 },
      { key: 'locale', type: 'enum', required: true, elements: ['en', 'pt'] },
    ],
    indexes: [
      { key: 'idx_locale', type: 'key', attributes: ['locale'] },
      { key: 'idx_sort', type: 'key', attributes: ['sort'] },
    ],
  },
  {
    id: asTableId('experiences'),
    name: 'Experiences',
    uniqueLogicKeys: {
      byLocaleTitleOrganization: ['title', 'organization', 'locale'],
    },
    columns: [
      { key: 'title', type: 'string', required: true, size: 128 },
      { key: 'organization', type: 'string', required: true, size: 128 },
      { key: 'location', type: 'string', required: true, size: 128 },
      { key: 'period', type: 'string', required: true, size: 64 },
      { key: 'description', type: 'string', required: true, size: 4096 },
      { key: 'current', type: 'boolean', required: true, default: false },
      { key: 'sort', type: 'integer', required: true, default: 0 },
      { key: 'locale', type: 'enum', required: true, elements: ['en', 'pt'] },
    ],
    indexes: [
      { key: 'idx_locale', type: 'key', attributes: ['locale'] },
      { key: 'idx_sort', type: 'key', attributes: ['sort'] },
    ],
  },
];
