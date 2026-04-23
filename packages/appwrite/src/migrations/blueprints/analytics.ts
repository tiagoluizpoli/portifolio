import { asTableId } from '@repo/appwrite-core';
import type { TableBlueprint } from '../blueprints.js';

export const analyticsBlueprints: TableBlueprint[] = [
  {
    id: asTableId('impact_metrics'),
    name: 'Impact Metrics',
    uniqueLogicKeys: {
      byAboutCodeLocale: ['aboutId', 'internalCode', 'locale'],
    },
    columns: [
      { key: 'aboutId', type: 'string', required: true, size: 36 },
      { key: 'internalCode', type: 'string', required: true, size: 64 },
      { key: 'label', type: 'string', required: true, size: 128 },
      { key: 'value', type: 'string', required: true, size: 64 },
      { key: 'sourceId', type: 'string', required: true, size: 36 },
      { key: 'isPlaceholder', type: 'boolean', required: true, default: false },
      { key: 'locale', type: 'enum', required: true, elements: ['en', 'pt'] },
    ],
    indexes: [
      { key: 'idx_about', type: 'key', attributes: ['aboutId'] },
      { key: 'idx_source', type: 'key', attributes: ['sourceId'] },
      { key: 'idx_locale', type: 'key', attributes: ['locale'] },
    ],
  },
  {
    id: asTableId('metric_sources'),
    name: 'Metric Sources',
    uniqueLogicKeys: {
      byName: ['name'],
    },
    columns: [
      { key: 'name', type: 'string', required: true, size: 128 },
      { key: 'type', type: 'string', required: true, size: 64 },
      { key: 'iconCode', type: 'string', required: true, size: 64 },
      { key: 'status', type: 'string', required: true, size: 32 },
    ],
    indexes: [{ key: 'idx_type', type: 'key', attributes: ['type'] }],
  },
];
