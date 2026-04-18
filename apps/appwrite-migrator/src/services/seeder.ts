import {
  type AboutInsert,
  AboutInsertSchema,
  blueprints,
  type ContactInfoInsert,
  ContactInfoInsertSchema,
  type EducationInsert,
  EducationInsertSchema,
  type ExperienceInsert,
  ExperienceInsertSchema,
  type HomeInsert,
  HomeInsertSchema,
  type ImpactMetricInsert,
  ImpactMetricInsertSchema,
  type MetricSourceInsert,
  MetricSourceInsertSchema,
  type PlatformInsert,
  PlatformInsertSchema,
  type SkillInsert,
  SkillInsertSchema,
  type SocialInsert,
  SocialInsertSchema,
  type SolutionInsert,
  SolutionInsertSchema,
} from '@repo/appwrite';
import { z } from 'zod';

export type SeedTableId =
  | 'about'
  | 'home'
  | 'contact_info'
  | 'socials'
  | 'platforms'
  | 'solutions'
  | 'skills'
  | 'educations'
  | 'experiences'
  | 'impact_metrics'
  | 'metric_sources';

export interface SeedValidationIssue {
  path: string;
  message: string;
}

export interface SeedValidationFailure {
  tableId: SeedTableId;
  rowIndex: number;
  issues: SeedValidationIssue[];
}

export class SeedValidationError extends Error {
  readonly failures: SeedValidationFailure[];

  constructor(failures: SeedValidationFailure[]) {
    super(`Seed validation failed with ${failures.length} invalid row(s).`);
    this.name = 'SeedValidationError';
    this.failures = failures;
  }
}

export interface ValidatedSeedPayload {
  about: AboutInsert[];
  home: HomeInsert[];
  contact_info: ContactInfoInsert[];
  socials: SocialInsert[];
  platforms: PlatformInsert[];
  solutions: SolutionInsert[];
  skills: SkillInsert[];
  educations: EducationInsert[];
  experiences: ExperienceInsert[];
  impact_metrics: ImpactMetricInsert[];
  metric_sources: MetricSourceInsert[];
}

interface SeedTemplateTableLayer {
  uniqueLogicKeys: Record<string, string[]>;
  rows: Array<Record<string, unknown>>;
}

export interface SeedTemplate {
  version: 1;
  generatedAt: string;
  tables: Record<SeedTableId, SeedTemplateTableLayer>;
}

export interface SeedTemplateArtifacts {
  template: SeedTemplate;
  templateJson: string;
  markdownSpec: string;
}

export interface ExistingSeedRow {
  id: string;
  [key: string]: unknown;
}

export type ExistingSeedState = Partial<Record<SeedTableId, ExistingSeedRow[]>>;

export type SeedUpsertAction = 'create' | 'update' | 'ignore';

export interface SeedUpsertOperation {
  tableId: SeedTableId;
  rowIndex: number;
  action: SeedUpsertAction;
  data: Record<string, unknown>;
  rowId?: string;
  matchedBy?: string;
}

export interface SeedUpsertPlan {
  operations: SeedUpsertOperation[];
  summary: Record<SeedUpsertAction, number>;
}

export interface SeedExecutionStats {
  processed: number;
  created: number;
  updated: number;
  ignored: number;
  retries: number;
}

export interface SeedExecutionInput {
  plan: SeedUpsertPlan;
  executeOperation: (operation: SeedUpsertOperation) => Promise<void>;
  maxRetries?: number;
  retryDelayMs?: number;
}

export class SeedRateLimitError extends Error {
  readonly operation: SeedUpsertOperation;
  readonly attempts: number;

  constructor(input: { operation: SeedUpsertOperation; attempts: number }) {
    super(
      `Seed execution failed due to repeated rate limiting after ${input.attempts} attempt(s).`,
    );
    this.name = 'SeedRateLimitError';
    this.operation = input.operation;
    this.attempts = input.attempts;
  }
}

export interface SeedDeduplicationConflict {
  tableId: SeedTableId;
  rowIndex: number;
  key: string;
  fields: string[];
  values: Record<string, unknown>;
  matchingIds: string[];
}

export class SeedDeduplicationError extends Error {
  readonly conflicts: SeedDeduplicationConflict[];

  constructor(conflicts: SeedDeduplicationConflict[]) {
    super(`Seed deduplication failed with ${conflicts.length} conflict(s).`);
    this.name = 'SeedDeduplicationError';
    this.conflicts = conflicts;
  }
}

type BlueprintTable = (typeof blueprints)[number];
type BlueprintColumn = BlueprintTable['columns'][number];

const seedShapeSchema = z
  .object({
    about: z.array(z.unknown()).default([]),
    home: z.array(z.unknown()).default([]),
    contact_info: z.array(z.unknown()).default([]),
    socials: z.array(z.unknown()).default([]),
    platforms: z.array(z.unknown()).default([]),
    solutions: z.array(z.unknown()).default([]),
    skills: z.array(z.unknown()).default([]),
    educations: z.array(z.unknown()).default([]),
    experiences: z.array(z.unknown()).default([]),
    impact_metrics: z.array(z.unknown()).default([]),
    metric_sources: z.array(z.unknown()).default([]),
  })
  .strict();

const rowSchemaByTable: {
  [K in SeedTableId]: z.ZodSchema<ValidatedSeedPayload[K][number]>;
} = {
  about: AboutInsertSchema,
  home: HomeInsertSchema,
  contact_info: ContactInfoInsertSchema,
  socials: SocialInsertSchema,
  platforms: PlatformInsertSchema,
  solutions: SolutionInsertSchema,
  skills: SkillInsertSchema,
  educations: EducationInsertSchema,
  experiences: ExperienceInsertSchema,
  impact_metrics: ImpactMetricInsertSchema,
  metric_sources: MetricSourceInsertSchema,
};

type ApiConstrainedColumnType = 'string' | 'email';

interface ApiValidationRule {
  key: string;
  type: ApiConstrainedColumnType;
  required: boolean;
  size?: number;
}

const emailSchema = z.string().email();
const blueprintById = new Map(blueprints.map((table) => [table.id, table]));

const apiRulesByTable = Object.fromEntries(
  (Object.keys(rowSchemaByTable) as SeedTableId[]).map((tableId) => {
    const tableBlueprint = blueprintById.get(tableId);

    if (!tableBlueprint) {
      return [tableId, [] as ApiValidationRule[]];
    }

    const rules: ApiValidationRule[] = tableBlueprint.columns
      .filter(
        (
          column,
        ): column is typeof column & { type: ApiConstrainedColumnType } =>
          column.type === 'string' || column.type === 'email',
      )
      .map((column) => ({
        key: column.key,
        type: column.type,
        required: column.required,
        size: column.type === 'string' ? column.size : undefined,
      }));

    return [tableId, rules];
  }),
) as Record<SeedTableId, ApiValidationRule[]>;

const pathSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
});

function cloneUniqueLogicKeys(
  source: Record<string, string[]>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(source).map(([key, values]) => [key, [...values]]),
  );
}

function resolveSampleScalarValue(
  tableId: SeedTableId,
  column: BlueprintColumn,
): string | number | boolean | null {
  if (column.default !== undefined) {
    return column.default;
  }

  switch (column.type) {
    case 'string':
      return `${tableId}_${column.key}`;
    case 'integer':
      return 0;
    case 'float':
      return 0;
    case 'boolean':
      return false;
    case 'datetime':
      return '2026-01-01T00:00:00.000Z';
    case 'email':
      return 'seed@example.com';
    case 'enum':
      return column.elements?.[0] ?? null;
    case 'url':
      return `https://example.com/${tableId}/${column.key}`;
    case 'ip':
      return '127.0.0.1';
    default:
      return null;
  }
}

function buildTemplateRow(
  tableId: SeedTableId,
  columns: BlueprintColumn[],
): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  for (const column of columns) {
    const scalarValue = resolveSampleScalarValue(tableId, column);
    row[column.key] = column.array ? [scalarValue] : scalarValue;
  }

  return row;
}

function buildMarkdownSpec(template: SeedTemplate): string {
  const lines: string[] = [
    '# Seed Template Specification',
    '',
    `Generated at: ${template.generatedAt}`,
    '',
  ];

  for (const tableId of Object.keys(rowSchemaByTable) as SeedTableId[]) {
    const tableBlueprint = blueprintById.get(tableId);

    if (!tableBlueprint) {
      continue;
    }

    lines.push(`## Table \`${tableId}\``);
    lines.push('');
    lines.push('### Unique Logic Keys');

    for (const [key, values] of Object.entries(
      tableBlueprint.uniqueLogicKeys,
    )) {
      lines.push(`- ${key}: ${values.join(', ')}`);
    }

    lines.push('');
    lines.push('### Columns');
    lines.push('');
    lines.push('| key | type | required | size | default |');
    lines.push('| --- | --- | --- | --- | --- |');

    for (const column of tableBlueprint.columns) {
      const required = column.required ? 'required' : 'optional';
      const size = typeof column.size === 'number' ? String(column.size) : '-';
      const defaultValue =
        column.default !== undefined ? String(column.default) : '-';

      lines.push(
        `| ${column.key} | ${column.type} | ${required} | ${size} | ${defaultValue} |`,
      );
    }

    lines.push('');
    lines.push('### Example Row');
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(template.tables[tableId].rows[0], null, 2));
    lines.push('```');
    lines.push('');
  }

  return lines.join('\n');
}

function formatIssues(error: z.ZodError): SeedValidationIssue[] {
  return error.issues.map((issue) => {
    const parsed = pathSchema.parse({
      path: issue.path,
      message: issue.message,
    });

    return {
      path: parsed.path.map(String).join('.') || 'row',
      message: parsed.message,
    };
  });
}

function toSeedRowRecord(row: unknown): Record<string, unknown> {
  return { ...(row as Record<string, unknown>) };
}

function valuesEqual(left: unknown, right: unknown): boolean {
  if (left === right) {
    return true;
  }

  return JSON.stringify(left) === JSON.stringify(right);
}

function isRateLimitError(error: unknown): boolean {
  const candidate = error as { code?: unknown; status?: unknown };
  return candidate.code === 429 || candidate.status === 429;
}

async function delay(ms: number): Promise<void> {
  if (ms <= 0) {
    return;
  }

  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function hasRowChanges(
  existing: ExistingSeedRow,
  incoming: Record<string, unknown>,
): boolean {
  for (const [key, value] of Object.entries(incoming)) {
    if (!valuesEqual(existing[key], value)) {
      return true;
    }
  }

  return false;
}

function resolveBatchSignature(
  tableId: SeedTableId,
  row: Record<string, unknown>,
): { key: string; value: string } | null {
  const tableBlueprint = blueprintById.get(tableId);

  if (!tableBlueprint) {
    return null;
  }

  for (const [key, fields] of Object.entries(tableBlueprint.uniqueLogicKeys)) {
    if (fields.some((field) => row[field] === undefined)) {
      continue;
    }

    const signature = fields
      .map((field) => `${field}:${JSON.stringify(row[field])}`)
      .join('|');

    return {
      key,
      value: `${key}:${signature}`,
    };
  }

  return null;
}

function findUniqueMatch(
  tableId: SeedTableId,
  rowIndex: number,
  row: Record<string, unknown>,
  existingRows: ExistingSeedRow[],
): {
  matchedId?: string;
  matchedBy?: string;
  conflict?: SeedDeduplicationConflict;
} {
  const tableBlueprint = blueprintById.get(tableId);

  if (!tableBlueprint) {
    return {};
  }

  const matches = new Map<
    string,
    { key: string; fields: string[]; values: Record<string, unknown> }
  >();

  for (const [key, fields] of Object.entries(tableBlueprint.uniqueLogicKeys)) {
    if (fields.some((field) => row[field] === undefined)) {
      continue;
    }

    const matched = existingRows.filter((existing) =>
      fields.every((field) => valuesEqual(existing[field], row[field])),
    );

    for (const match of matched) {
      const values = Object.fromEntries(
        fields.map((field) => [field, row[field]]),
      );
      matches.set(match.id, { key, fields, values });
    }
  }

  if (matches.size === 0) {
    return {};
  }

  if (matches.size > 1) {
    const first = matches.values().next().value as {
      key: string;
      fields: string[];
      values: Record<string, unknown>;
    };

    return {
      conflict: {
        tableId,
        rowIndex,
        key: first.key,
        fields: first.fields,
        values: first.values,
        matchingIds: [...matches.keys()],
      },
    };
  }

  const [matchedId, matchedData] = [...matches.entries()][0];

  return {
    matchedId,
    matchedBy: matchedData.key,
  };
}

function validateApiLevelConstraints(
  tableId: SeedTableId,
  row: ValidatedSeedPayload[SeedTableId][number],
): SeedValidationIssue[] {
  const rowData = row as Record<string, unknown>;
  const issues: SeedValidationIssue[] = [];

  for (const rule of apiRulesByTable[tableId]) {
    const rawValue = rowData[rule.key];

    if (typeof rawValue !== 'string') {
      continue;
    }

    if (rule.required && rawValue.trim().length === 0) {
      issues.push({
        path: rule.key,
        message: 'String value cannot be empty or whitespace only.',
      });
      continue;
    }

    if (typeof rule.size === 'number' && rawValue.length > rule.size) {
      issues.push({
        path: rule.key,
        message: `String exceeds max size ${rule.size}.`,
      });
    }

    if (rule.type === 'email') {
      const parsedEmail = emailSchema.safeParse(rawValue);

      if (!parsedEmail.success) {
        issues.push({
          path: rule.key,
          message: 'Invalid email format.',
        });
      }
    }
  }

  return issues;
}

export class SeederService {
  generateTemplateArtifacts(options?: {
    generatedAt?: string;
  }): SeedTemplateArtifacts {
    const generatedAt = options?.generatedAt ?? new Date().toISOString();
    const tables = {} as Record<SeedTableId, SeedTemplateTableLayer>;

    for (const tableId of Object.keys(rowSchemaByTable) as SeedTableId[]) {
      const tableBlueprint = blueprintById.get(tableId);

      if (!tableBlueprint) {
        tables[tableId] = {
          uniqueLogicKeys: {},
          rows: [{}],
        };
        continue;
      }

      tables[tableId] = {
        uniqueLogicKeys: cloneUniqueLogicKeys(tableBlueprint.uniqueLogicKeys),
        rows: [buildTemplateRow(tableId, tableBlueprint.columns)],
      };
    }

    const template: SeedTemplate = {
      version: 1,
      generatedAt,
      tables,
    };

    return {
      template,
      templateJson: JSON.stringify(template, null, 2),
      markdownSpec: buildMarkdownSpec(template),
    };
  }

  validateRows(input: unknown): ValidatedSeedPayload {
    const shaped = seedShapeSchema.parse(input);
    const failures: SeedValidationFailure[] = [];

    const validated: ValidatedSeedPayload = {
      about: [],
      home: [],
      contact_info: [],
      socials: [],
      platforms: [],
      solutions: [],
      skills: [],
      educations: [],
      experiences: [],
      impact_metrics: [],
      metric_sources: [],
    };

    for (const tableId of Object.keys(rowSchemaByTable) as SeedTableId[]) {
      const schema = rowSchemaByTable[tableId];
      const rows = shaped[tableId];

      rows.forEach((row, rowIndex) => {
        const parsed = schema.safeParse(row);

        if (!parsed.success) {
          failures.push({
            tableId,
            rowIndex,
            issues: formatIssues(parsed.error),
          });
          return;
        }

        const apiIssues = validateApiLevelConstraints(tableId, parsed.data);

        if (apiIssues.length > 0) {
          failures.push({
            tableId,
            rowIndex,
            issues: apiIssues,
          });
          return;
        }

        // safeParse guarantees that parsed.data matches the target table insert schema.
        (validated[tableId] as Array<unknown>).push(parsed.data);
      });
    }

    if (failures.length > 0) {
      throw new SeedValidationError(failures);
    }

    return validated;
  }

  buildUpsertPlan(input: {
    validatedRows: ValidatedSeedPayload;
    existingRows?: ExistingSeedState;
  }): SeedUpsertPlan {
    const operations: SeedUpsertOperation[] = [];
    const conflicts: SeedDeduplicationConflict[] = [];

    for (const tableId of Object.keys(rowSchemaByTable) as SeedTableId[]) {
      const rows = input.validatedRows[tableId];
      const remoteRows = [...(input.existingRows?.[tableId] ?? [])];
      const seenSignatures = new Set<string>();

      rows.forEach((row, rowIndex) => {
        const rowData = toSeedRowRecord(row);
        const signature = resolveBatchSignature(tableId, rowData);

        if (signature && seenSignatures.has(signature.value)) {
          operations.push({
            tableId,
            rowIndex,
            action: 'ignore',
            data: rowData,
            matchedBy: signature.key,
          });
          return;
        }

        if (signature) {
          seenSignatures.add(signature.value);
        }

        const match = findUniqueMatch(tableId, rowIndex, rowData, remoteRows);

        if (match.conflict) {
          conflicts.push(match.conflict);
          return;
        }

        if (!match.matchedId) {
          operations.push({
            tableId,
            rowIndex,
            action: 'create',
            data: rowData,
            matchedBy: signature?.key,
          });
          remoteRows.push({
            id: `planned_${tableId}_${rowIndex}`,
            ...rowData,
          });
          return;
        }

        const existing = remoteRows.find((item) => item.id === match.matchedId);

        if (!existing) {
          operations.push({
            tableId,
            rowIndex,
            action: 'create',
            data: rowData,
            matchedBy: signature?.key,
          });
          return;
        }

        if (hasRowChanges(existing, rowData)) {
          operations.push({
            tableId,
            rowIndex,
            action: 'update',
            data: rowData,
            rowId: existing.id,
            matchedBy: match.matchedBy,
          });

          Object.assign(existing, rowData);
          return;
        }

        operations.push({
          tableId,
          rowIndex,
          action: 'ignore',
          data: rowData,
          rowId: existing.id,
          matchedBy: match.matchedBy,
        });
      });
    }

    if (conflicts.length > 0) {
      throw new SeedDeduplicationError(conflicts);
    }

    const summary: Record<SeedUpsertAction, number> = {
      create: 0,
      update: 0,
      ignore: 0,
    };

    for (const operation of operations) {
      summary[operation.action] += 1;
    }

    return {
      operations,
      summary,
    };
  }

  async executeUpsertPlan(
    input: SeedExecutionInput,
  ): Promise<SeedExecutionStats> {
    const maxRetries = input.maxRetries ?? 2;
    const retryDelayMs = input.retryDelayMs ?? 0;

    const stats: SeedExecutionStats = {
      processed: 0,
      created: 0,
      updated: 0,
      ignored: 0,
      retries: 0,
    };

    for (const operation of input.plan.operations) {
      if (operation.action === 'ignore') {
        stats.ignored += 1;
        stats.processed += 1;
        continue;
      }

      let attempts = 0;

      while (true) {
        attempts += 1;

        try {
          await input.executeOperation(operation);

          if (operation.action === 'create') {
            stats.created += 1;
          }

          if (operation.action === 'update') {
            stats.updated += 1;
          }

          stats.processed += 1;
          break;
        } catch (error) {
          const canRetry = isRateLimitError(error) && attempts <= maxRetries;

          if (!canRetry) {
            if (isRateLimitError(error)) {
              throw new SeedRateLimitError({
                operation,
                attempts,
              });
            }

            throw error;
          }

          stats.retries += 1;
          await delay(retryDelayMs);
        }
      }
    }

    return stats;
  }
}
