import type { TableId } from '@repo/appwrite-core';
import { z } from 'zod';
import { analyticsBlueprints } from './blueprints/analytics.js';
import { careerBlueprints } from './blueprints/career.js';
import { ecosystemBlueprints } from './blueprints/ecosystem.js';
import { identityBlueprints } from './blueprints/identity.js';

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
  id: TableId;
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
    id: z
      .string()
      .regex(TABLE_ID_REGEX)
      .transform((v) => v as TableId),
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
  ...identityBlueprints,
  ...careerBlueprints,
  ...ecosystemBlueprints,
  ...analyticsBlueprints,
]);
