import {
  type RepositoryFactory,
  type StorageService,
} from '../index.js';

export interface SeedOperation {
  action: 'create' | 'update';
  tableId: string;
  data: Record<string, unknown>;
  rowId?: string;
  rowIndex: number;
}

export interface UpsertPlan {
  operations: SeedOperation[];
}

export interface UpsertStats {
  created: number;
  updated: number;
  ignored: number;
  retries: number;
}

export interface SeedPayload {
  [tableId: string]: unknown[];
}

export class SeedEngine {
  constructor(
    private readonly repositoryFactory: RepositoryFactory,
    private readonly storageService: StorageService,
  ) { }

  async downloadPayload(input: {
    bucketId: string;
    fileName: string;
  }): Promise<unknown> {
    const fileId = await this.storageService.resolveFileIdByName({
      bucketId: input.bucketId,
      fileName: input.fileName,
    });

    const buffer = await this.storageService.download({
      bucketId: input.bucketId,
      fileId,
    });

    return JSON.parse(buffer.toString('utf8'));
  }

  async fetchRemoteState(input: {
    tableIds: string[];
    pageSize: number;
  }): Promise<Record<string, { id: string;[key: string]: unknown }[]>> {
    const state: Record<string, { id: string;[key: string]: unknown }[]> = {};

    await Promise.all(
      input.tableIds.map(async (tableId) => {
        state[tableId] = await this.listAllRows(tableId, input.pageSize);
      }),
    );

    return state;
  }

  async listAllRows(
    tableId: string,
    pageSize: number,
  ): Promise<{ id: string;[key: string]: unknown }[]> {
    const rows: { id: string;[key: string]: unknown }[] = [];
    let offset = 0;
    const repo = this.repositoryFactory.getRepository(tableId);

    while (true) {
      const page = await repo.findMany({
        limit: pageSize,
        offset,
      });

      for (const domainRow of page) {
        rows.push({
          ...(domainRow as unknown as Record<string, unknown>),
          id: domainRow.id,
        });
      }

      if (page.length < pageSize) {
        break;
      }

      offset += page.length;
    }

    return rows;
  }

  async executeUpsert(
    plan: UpsertPlan,
    onProgress?: (op: SeedOperation, stats: UpsertStats) => void,
  ): Promise<UpsertStats> {
    const stats: UpsertStats = {
      created: 0,
      updated: 0,
      ignored: 0,
      retries: 0,
    };

    for (const operation of plan.operations) {
      const repo = this.repositoryFactory.getRepository(operation.tableId);

      if (operation.action === 'create') {
        await repo.create({
          data: operation.data,
        });
        stats.created++;
      } else if (operation.action === 'update') {
        if (!operation.rowId) {
          throw new Error(
            `Missing rowId for update operation at ${operation.tableId}#${operation.rowIndex}`,
          );
        }

        await repo.update({
          id: operation.rowId,
          data: operation.data,
        });
        stats.updated++;
      }

      onProgress?.(operation, stats);
    }

    return stats;
  }
}
