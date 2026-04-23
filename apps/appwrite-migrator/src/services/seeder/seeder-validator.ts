import type {
  AboutInsert,
  ContactInfoInsert,
  EducationInsert,
  ExperienceInsert,
  HomeInsert,
  ImpactMetricInsert,
  MetricSourceInsert,
  PlatformInsert,
  SkillInsert,
  SocialInsert,
  SolutionInsert,
} from '@repo/appwrite';
import {
  AboutInsertSchema,
  ContactInfoInsertSchema,
  EducationInsertSchema,
  ExperienceInsertSchema,
  HomeInsertSchema,
  ImpactMetricInsertSchema,
  MetricSourceInsertSchema,
  PlatformInsertSchema,
  SkillInsertSchema,
  SocialInsertSchema,
  SolutionInsertSchema,
} from '@repo/appwrite';
import { z } from 'zod';
import { validateApiLevelConstraints } from './seeder-validator-rules';
import { SEED_TABLE_IDS } from '@/core/constants';

export type SeedTableId = (typeof SEED_TABLE_IDS)[number];

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
    const shaped = seedShapeSchema.parse(input) as Record<
      SeedTableId,
      unknown[]
    >;
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

    SEED_TABLE_IDS.forEach((tableId) => {
      validateTableRows({
        tableId,
        rows: shaped[tableId],
        validated,
        failures,
      });
    });

    if (failures.length > 0) {
      throw new SeedValidationError(failures);
    }

    return validated;
  }
}
