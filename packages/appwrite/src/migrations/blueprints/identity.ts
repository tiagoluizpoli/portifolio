import { asTableId } from '@repo/appwrite-core';
import type { TableBlueprint } from '../blueprints.js';

export const identityBlueprints: TableBlueprint[] = [
  {
    id: asTableId('about'),
    name: 'About',
    uniqueLogicKeys: {
      byLocale: ['locale'],
      byName: ['locale', 'name'],
      byTitle: ['locale', 'title'],
      byBio: ['locale', 'bio'],
    },
    columns: [
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'title', type: 'string', required: true, size: 255 },
      { key: 'bio', type: 'string', required: true, size: 4096 },
      { key: 'locale', type: 'enum', required: true, elements: ['en', 'pt'] },
    ],
    indexes: [{ key: 'idx_locale', type: 'key', attributes: ['locale'] }],
  },
  {
    id: asTableId('home'),
    name: 'Home',
    uniqueLogicKeys: {
      byLocaleHeroTitle: ['locale', 'heroTitle'],
      byLocaleHeroSubtitle: ['locale', 'heroSubtitle'],
      byLocaleCtaText: ['locale', 'ctaText'],
      byLocaleCtaLink: ['locale', 'ctaLink'],
    },
    columns: [
      { key: 'heroTitle', type: 'string', required: true, size: 255 },
      { key: 'heroSubtitle', type: 'string', required: true, size: 512 },
      { key: 'ctaText', type: 'string', required: true, size: 64 },
      { key: 'ctaLink', type: 'string', required: true, size: 255 },
      { key: 'locale', type: 'enum', required: true, elements: ['en', 'pt'] },
    ],
    indexes: [{ key: 'idx_locale', type: 'key', attributes: ['locale'] }],
  },
  {
    id: asTableId('contact_info'),
    name: 'Contact Info',
    uniqueLogicKeys: {
      byLocaleEmail: ['locale', 'email'],
      byLocalePhone: ['locale', 'phone'],
      byLocaleLocation: ['locale', 'location'],
    },
    columns: [
      { key: 'email', type: 'email', required: true },
      { key: 'phone', type: 'string', required: true, size: 32 },
      { key: 'location', type: 'string', required: true, size: 128 },
      { key: 'locale', type: 'enum', required: true, elements: ['en', 'pt'] },
    ],
    indexes: [{ key: 'idx_locale', type: 'key', attributes: ['locale'] }],
  },
  {
    id: asTableId('socials'),
    name: 'Socials',
    uniqueLogicKeys: {
      byPlatformUsername: ['platformId', 'username'],
    },
    columns: [
      { key: 'platformId', type: 'string', required: true, size: 36 },
      { key: 'username', type: 'string', required: true, size: 128 },
      { key: 'iconId', type: 'string', required: true, size: 128 },
      { key: 'active', type: 'boolean', required: true, default: true },
      { key: 'sort', type: 'integer', required: true, default: 0 },
    ],
    indexes: [
      { key: 'idx_platform', type: 'key', attributes: ['platformId'] },
      { key: 'idx_sort', type: 'key', attributes: ['sort'] },
    ],
  },
  {
    id: asTableId('platforms'),
    name: 'Platforms',
    uniqueLogicKeys: {
      byTitle: ['title'],
    },
    columns: [
      { key: 'title', type: 'string', required: true, size: 128 },
      { key: 'urlTemplate', type: 'string', required: true, size: 255 },
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
      { key: 'idx_status', type: 'key', attributes: ['status'] },
      { key: 'idx_sort', type: 'key', attributes: ['sort'] },
    ],
  },
];
