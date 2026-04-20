import { RepositoryFactory, SeedEngine, StorageService } from '@repo/appwrite';
import { BaseService } from '@/core/base-service';
import { SEED_PAGE_SIZE, SEED_TABLE_IDS } from '@/core/constants';
import type { MigratorContext } from '@/core/types';
import {
  type ExistingSeedRow,
  type ExistingSeedState,
  SeederService as InternalSeeder,
  type SeedTableId,
} from '@/services/seeder';

export class SeedService extends BaseService {
  async execute(context: MigratorContext): Promise<void> {
    const bucketId = context.config.migrator.seedBucketId;
    const fileName = context.payload || context.config.migrator.seedFileName;

    if (!bucketId || !fileName) {
      throw new Error(
        'Missing seed source configuration. Provide SEED_BUCKET_ID and SEED_FILE_NAME (or use --payload).',
      );
    }

    this.log('seed', `Starting seeding from ${fileName}...`);

    const internalSeeder = new InternalSeeder();
    const storageService = new StorageService();
    const databaseId = context.config.appwrite.databaseId;
    const repositoryFactory = new RepositoryFactory(databaseId);
    const engine = new SeedEngine(repositoryFactory, storageService);

    const rawPayload = await engine.downloadPayload({
      bucketId,
      fileName,
    });

    const normalizedPayload = this.normalizeSeedPayloadShape(rawPayload);
    const validatedRows = internalSeeder.validateRows(normalizedPayload);

    const existingRows = await engine.fetchRemoteState({
      tableIds: [...SEED_TABLE_IDS],
      pageSize: SEED_PAGE_SIZE,
    });

    const plan = internalSeeder.buildUpsertPlan({
      validatedRows,
      existingRows: this.normalizeExistingSeedState(existingRows),
    });

    const executionPlan = {
      operations: plan.operations
        .filter((op) => op.action === 'create' || op.action === 'update')
        .map((op) => ({
          action: op.action as 'create' | 'update',
          tableId: op.tableId,
          data: op.data,
          rowId: op.rowId,
          rowIndex: op.rowIndex,
        })),
    };

    const stats = await engine.executeUpsert(executionPlan, (operation) => {
      this.log(
        'seed',
        `  [${operation.action}] ${operation.tableId} row ${operation.rowIndex + 1}`,
      );
    });

    this.log(
      'seed',
      `Seed complete. operations=${plan.operations.length} created=${stats.created} updated=${stats.updated} ignored=${plan.summary.ignore} retries=${stats.retries}`,
    );
  }

  private normalizeSeedPayloadShape(input: unknown): unknown {
    if (!this.isRecord(input)) {
      return input;
    }

    const templateTables = input.tables;

    if (!this.isRecord(templateTables)) {
      return input;
    }

    let hasTemplateRows = false;
    const normalized: Partial<Record<SeedTableId, unknown[]>> = {};

    for (const tableId of SEED_TABLE_IDS) {
      const tableEntry = templateTables[tableId];

      if (!this.isRecord(tableEntry)) {
        continue;
      }

      if (!Array.isArray(tableEntry.rows)) {
        continue;
      }

      normalized[tableId as SeedTableId] = tableEntry.rows;
      hasTemplateRows = true;
    }

    return hasTemplateRows ? normalized : input;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private normalizeExistingSeedState(input: unknown): ExistingSeedState {
    if (!this.isRecord(input)) {
      return {};
    }

    const normalized: ExistingSeedState = {};

    for (const tableId of SEED_TABLE_IDS) {
      const tableRows = input[tableId];

      if (!Array.isArray(tableRows)) {
        continue;
      }

      const rows = tableRows
        .map((row) => this.toExistingSeedRow(row))
        .filter((row): row is ExistingSeedRow => row !== null);

      if (rows.length > 0) {
        normalized[tableId] = rows;
      }
    }

    return normalized;
  }

  private toExistingSeedRow(input: unknown): ExistingSeedRow | null {
    if (!this.isRecord(input)) {
      return null;
    }

    const id = input.id;

    if (typeof id !== 'string' || id.trim().length === 0) {
      return null;
    }

    return {
      ...input,
      id,
    };
  }
}
