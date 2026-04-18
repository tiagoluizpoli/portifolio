import { z } from 'zod';

export const TABLE_ID_REGEX = /^[a-z][a-z0-9_]*$/;
export const COLUMN_KEY_REGEX = /^[A-Za-z][A-Za-z0-9_]*$/;
export const INDEX_KEY_REGEX = /^[a-z][a-z0-9_]*$/;

export type ColumnType =
  | 'string'
  | 'integer'
  | 'float'
  | 'boolean'
  | 'datetime'
  | 'email'
  | 'enum'
  | 'url'
  | 'ip';

export interface ColumnDefinition {
  key: string;
  type: ColumnType;
  required: boolean;
  size?: number;
  default?: string | number | boolean | null;
  elements?: string[];
  array?: boolean;
}

export type IndexType = 'key' | 'unique' | 'fulltext';

export interface IndexDefinition {
  key: string;
  type: IndexType;
  attributes: string[];
  orders?: ('ASC' | 'DESC')[];
}

export interface TableBlueprint {
  id: string;
  name: string;
  uniqueLogicKeys: Record<string, string[]>;
  columns: ColumnDefinition[];
  indexes: IndexDefinition[];
}

export const ColumnDefinitionSchema = z.object({
  key: z.string().regex(COLUMN_KEY_REGEX),
  type: z.enum([
    'string',
    'integer',
    'float',
    'boolean',
    'datetime',
    'email',
    'enum',
    'url',
    'ip',
  ]),
  required: z.boolean(),
  size: z.number().int().positive().optional(),
  default: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  elements: z.array(z.string().min(1)).optional(),
  array: z.boolean().optional(),
});

export const IndexDefinitionSchema = z.object({
  key: z.string().regex(INDEX_KEY_REGEX),
  type: z.enum(['key', 'unique', 'fulltext']),
  attributes: z.array(z.string().regex(COLUMN_KEY_REGEX)).min(1),
  orders: z.array(z.enum(['ASC', 'DESC'])).optional(),
});

export const TableBlueprintSchema = z
  .object({
    id: z.string().regex(TABLE_ID_REGEX),
    name: z.string().min(1),
    uniqueLogicKeys: z
      .record(
        z.string().min(1),
        z.array(z.string().regex(COLUMN_KEY_REGEX)).min(1),
      )
      .refine((entry) => Object.keys(entry).length > 0, {
        message: 'At least one unique logic key combination is required',
      }),
    columns: z.array(ColumnDefinitionSchema).min(1),
    indexes: z.array(IndexDefinitionSchema),
  })
  .superRefine((table, ctx) => {
    const validColumnKeys = new Set(table.columns.map((column) => column.key));

    for (const [combinationKey, fields] of Object.entries(
      table.uniqueLogicKeys,
    )) {
      for (const field of fields) {
        if (!validColumnKeys.has(field)) {
          ctx.addIssue({
            code: 'custom',
            path: ['uniqueLogicKeys', combinationKey],
            message: `Unknown uniqueLogicKey field "${field}" in combination "${combinationKey}" for table "${table.id}"`,
          });
        }
      }
    }
  });

export const BlueprintsSchema = z
  .array(TableBlueprintSchema)
  .superRefine((tables, ctx) => {
    const seen = new Set<string>();
    for (const table of tables) {
      if (seen.has(table.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['id'],
          message: `Duplicate table id "${table.id}"`,
        });
      }
      seen.add(table.id);
    }
  });

export const blueprints: TableBlueprint[] = BlueprintsSchema.parse([
  {
    id: 'about',
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
    id: 'home',
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
    id: 'contact_info',
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
    id: 'socials',
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
    id: 'platforms',
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
  {
    id: 'solutions',
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
    id: 'skills',
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
  {
    id: 'educations',
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
    id: 'experiences',
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
  {
    id: 'impact_metrics',
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
    id: 'metric_sources',
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
]);
