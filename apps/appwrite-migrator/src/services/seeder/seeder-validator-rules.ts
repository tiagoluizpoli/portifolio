import { blueprints } from '@repo/appwrite';
import type { TableId } from '@repo/appwrite-core';
import { z } from 'zod';
import type {
  SeedTableId,
  SeedValidationIssue,
  ValidatedSeedPayload,
} from './seeder-validator';

type ApiConstrainedColumnType = 'string' | 'email';

interface ApiValidationRule {
  key: string;
  type: ApiConstrainedColumnType;
  required: boolean;
  size?: number;
}

const emailSchema = z.email();

const blueprintById = new Map(blueprints.map((table) => [table.id, table]));

export const apiRulesByTable = Object.fromEntries(
  (
    [
      'about',
      'home',
      'contact_info',
      'socials',
      'platforms',
      'solutions',
      'skills',
      'educations',
      'experiences',
      'impact_metrics',
      'metric_sources',
    ] as const
  ).map((tableId) => {
    const tableBlueprint = blueprintById.get(tableId as TableId);

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

export function validateApiLevelConstraints(
  tableId: SeedTableId,
  row: ValidatedSeedPayload[SeedTableId][number],
): SeedValidationIssue[] {
  const issues: SeedValidationIssue[] = [];

  for (const rule of apiRulesByTable[tableId]) {
    const rawValue = Reflect.get(row, rule.key);

    if (typeof rawValue !== 'string') {
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
