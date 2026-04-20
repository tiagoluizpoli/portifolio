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

type ApiConstrainedColumnType = 'string' | 'email';

interface ApiValidationRule {
  key: string;
  type: ApiConstrainedColumnType;
  required: boolean;
  size?: number;
}

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

const pathSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
});

const emailSchema = z.string().email();

export const rowSchemaByTable: {
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

function validateApiLevelConstraints(
  tableId: SeedTableId,
  row: ValidatedSeedPayload[SeedTableId][number],
): SeedValidationIssue[] {
  const issues: SeedValidationIssue[] = [];

  for (const rule of apiRulesByTable[tableId]) {
    const rawValue = Reflect.get(row, rule.key);

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

function validateTableRows<K extends SeedTableId>(input: {
  tableId: K;
  rows: unknown[];
  validated: ValidatedSeedPayload;
  failures: SeedValidationFailure[];
}): void {
  const schema = rowSchemaByTable[input.tableId];

  input.rows.forEach((row, rowIndex) => {
    const parsed = schema.safeParse(row);

    if (!parsed.success) {
      input.failures.push({
        tableId: input.tableId,
        rowIndex,
        issues: formatIssues(parsed.error),
      });
      return;
    }

    const apiIssues = validateApiLevelConstraints(input.tableId, parsed.data);

    if (apiIssues.length > 0) {
      input.failures.push({
        tableId: input.tableId,
        rowIndex,
        issues: apiIssues,
      });
      return;
    }

    const targetRows = input.validated[input.tableId] as Array<
      ValidatedSeedPayload[K][number]
    >;
    targetRows.push(parsed.data as ValidatedSeedPayload[K][number]);
  });
}

export class SeederValidator {
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

    validateTableRows({
      tableId: 'about',
      rows: shaped.about,
      validated,
      failures,
    });
    validateTableRows({
      tableId: 'home',
      rows: shaped.home,
      validated,
      failures,
    });
    validateTableRows({
      tableId: 'contact_info',
      rows: shaped.contact_info,
      validated,
      failures,
    });
    validateTableRows({
      tableId: 'socials',
      rows: shaped.socials,
      validated,
      failures,
    });
    validateTableRows({
      tableId: 'platforms',
      rows: shaped.platforms,
      validated,
      failures,
    });
    validateTableRows({
      tableId: 'solutions',
      rows: shaped.solutions,
      validated,
      failures,
    });
    validateTableRows({
      tableId: 'skills',
      rows: shaped.skills,
      validated,
      failures,
    });
    validateTableRows({
      tableId: 'educations',
      rows: shaped.educations,
      validated,
      failures,
    });
    validateTableRows({
      tableId: 'experiences',
      rows: shaped.experiences,
      validated,
      failures,
    });
    validateTableRows({
      tableId: 'impact_metrics',
      rows: shaped.impact_metrics,
      validated,
      failures,
    });
    validateTableRows({
      tableId: 'metric_sources',
      rows: shaped.metric_sources,
      validated,
      failures,
    });

    if (failures.length > 0) {
      throw new SeedValidationError(failures);
    }

    return validated;
  }
}
