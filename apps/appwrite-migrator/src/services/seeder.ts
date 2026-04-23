import { SeederExecutor } from '@/services/seeder/seeder-executor';
import { SeederPlanner } from '@/services/seeder/seeder-planner';
import {
  SeederValidator,
  type SeedTableId,
  type ValidatedSeedPayload,
} from '@/services/seeder/seeder-validator';
import { TemplateGenerator } from '@/services/seeder/template-generator';

export { SeedRateLimitError } from '@/services/seeder/seeder-executor';
export type { SeedDeduplicationConflict } from '@/services/seeder/seeder-planner';
export { SeedDeduplicationError } from '@/services/seeder/seeder-planner';
export type {
  SeedTableId,
  SeedValidationFailure,
  SeedValidationIssue,
  ValidatedSeedPayload,
} from '@/services/seeder/seeder-validator';
export { SeedValidationError } from '@/services/seeder/seeder-validator';

export interface SeedTemplate {
  version: 1;
  generatedAt: string;
  tables: Record<SeedTableId, Array<Record<string, unknown>>>;
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

export class SeederService {
  private readonly validator: SeederValidator;
  private readonly planner: SeederPlanner;
  private readonly executor: SeederExecutor;
  private readonly generator: TemplateGenerator;

  constructor() {
    this.validator = new SeederValidator();
    this.planner = new SeederPlanner();
    this.executor = new SeederExecutor();
    this.generator = new TemplateGenerator();
  }

  generateTemplateArtifacts(options?: {
    generatedAt?: string;
  }): SeedTemplateArtifacts {
    return this.generator.generateTemplateArtifacts(options);
  }

  validateRows(input: unknown): ValidatedSeedPayload {
    return this.validator.validateRows(input);
  }

  buildUpsertPlan(input: {
    validatedRows: ValidatedSeedPayload;
    existingRows?: ExistingSeedState;
  }): SeedUpsertPlan {
    return this.planner.buildUpsertPlan(input);
  }

  async executeUpsertPlan(
    input: SeedExecutionInput,
  ): Promise<SeedExecutionStats> {
    return this.executor.executeUpsertPlan(input);
  }
}
