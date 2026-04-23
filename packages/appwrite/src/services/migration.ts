import type { TableId } from '@repo/appwrite-core';
import { IndexType, OrderBy, type TablesDB } from 'node-appwrite';
import { getTablesClient } from '../client.js';
import { mapAppwriteError } from '../errors/appwrite-errors.js';
import type { TableBlueprint } from '../migrations/blueprints.js';
import { createColumnDefinition } from './migration-columns.js';

export * from './migration-contracts.js';

import type {
  CreateIndexDefinitionInput,
  IMigrationService,
  MigrationApplyInput,
  MigrationApplyResult,
  MigrationCreatedColumn,
  MigrationCreatedIndex,
  MigrationRemoteState,
  MigrationServiceConfig,
  MigrationStructuralDelta,
  MigrationStructuralDeltaInput,
} from './migration-contracts.js';
import {
  applyAuthorizedDestructiveChanges,
  buildRemoteTableMap,
} from './migration-destructive.js';
import { loadRemoteTableState } from './migration-remote.js';
import {
  INDEX_CREATION_MAX_ATTEMPTS,
  INDEX_CREATION_RETRY_DELAY_MS,
  isColumnNotAvailableError,
  runWithRetry,
} from './migration-retry.js';
import {
  resolveBlueprintSet,
  resolveDatabaseId,
  sortMissingColumns,
} from './migration-utils.js';

export class MigrationService implements IMigrationService {
  private readonly databaseId: string;
  private readonly sdk: TablesDB;
  private readonly sleep?: (ms: number) => Promise<void>;

  constructor(config: MigrationServiceConfig = {}) {
    this.databaseId = resolveDatabaseId(config.databaseId);
    this.sdk = config.tablesClient ?? getTablesClient();
    this.sleep = config.sleep;
  }

  async loadRemoteState(): Promise<MigrationRemoteState> {
    try {
      const tableList = await this.sdk.listTables({
        databaseId: this.databaseId,
      });
      const tables = await Promise.all(
        tableList.tables.map((table) =>
          loadRemoteTableState({
            sdk: this.sdk,
            databaseId: this.databaseId,
            payload: { table },
          }),
        ),
      );

      return {
        tables: [...tables].sort((left, right) =>
          left.tableId.localeCompare(right.tableId),
        ),
      };
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }

  async calculateStructuralDelta(
    input: MigrationStructuralDeltaInput = {},
  ): Promise<MigrationStructuralDelta> {
    const blueprintSet = resolveBlueprintSet(input.blueprintSet);
    const remoteState = input.remoteState ?? (await this.loadRemoteState());

    const remoteTablesById = buildRemoteTableMap(remoteState);
    const missingTables: TableBlueprint[] = [];
    const missingColumns: MigrationStructuralDelta['missingColumns'] = [];

    for (const tableBlueprint of blueprintSet) {
      const remoteTable = remoteTablesById.get(tableBlueprint.id);

      if (!remoteTable) {
        missingTables.push(tableBlueprint);
        continue;
      }

      const remoteColumnKeySet = new Set(remoteTable.columnKeys);
      const pendingColumns = tableBlueprint.columns.filter(
        (column) => !remoteColumnKeySet.has(column.key),
      );

      if (pendingColumns.length === 0) {
        continue;
      }

      missingColumns.push({
        tableId: tableBlueprint.id,
        tableName: tableBlueprint.name,
        columns: pendingColumns,
      });
    }

    return {
      missingTables: [...missingTables].sort((left, right) =>
        left.id.localeCompare(right.id),
      ),
      missingColumns: sortMissingColumns(missingColumns),
    };
  }

  async migrate(
    input: MigrationApplyInput = {},
  ): Promise<MigrationApplyResult> {
    try {
      const blueprintSet = resolveBlueprintSet(input.blueprintSet);
      const remoteState = input.remoteState ?? (await this.loadRemoteState());
      const delta = await this.calculateStructuralDelta({
        blueprintSet,
        remoteState,
      });

      const createdTables: TableId[] = [];
      const createdColumns: MigrationCreatedColumn[] = [];
      const createdIndexes: MigrationCreatedIndex[] = [];

      const remoteTablesById = buildRemoteTableMap(remoteState);

      for (const table of delta.missingTables) {
        await this.sdk.createTable({
          databaseId: this.databaseId,
          tableId: table.id,
          name: table.name,
        });

        createdTables.push(table.id);

        for (const column of table.columns) {
          await createColumnDefinition({
            sdk: this.sdk,
            databaseId: this.databaseId,
            payload: { tableId: table.id, column },
          });

          createdColumns.push({ tableId: table.id, columnKey: column.key });
        }

        for (const index of table.indexes) {
          await this.createIndexDefinition({ tableId: table.id, index });
          createdIndexes.push({ tableId: table.id, indexKey: index.key });
        }
      }

      for (const missing of delta.missingColumns) {
        for (const column of missing.columns) {
          await createColumnDefinition({
            sdk: this.sdk,
            databaseId: this.databaseId,
            payload: { tableId: missing.tableId, column },
          });

          createdColumns.push({
            tableId: missing.tableId,
            columnKey: column.key,
          });
        }
      }

      for (const table of blueprintSet) {
        const remoteTable = remoteTablesById.get(table.id);
        if (!remoteTable) {
          continue;
        }

        const existingIndexKeys = new Set(remoteTable.indexKeys);

        for (const index of table.indexes) {
          if (existingIndexKeys.has(index.key)) {
            continue;
          }

          await this.createIndexDefinition({ tableId: table.id, index });
          createdIndexes.push({ tableId: table.id, indexKey: index.key });
        }
      }

      await applyAuthorizedDestructiveChanges({
        sdk: this.sdk,
        databaseId: this.databaseId,
        payload: {
          blueprintSet,
          remoteState,
          authorization: input.destructiveAuthorization,
        },
      });

      return { createdTables, createdColumns, createdIndexes };
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }

  private async createIndexDefinition(
    input: CreateIndexDefinitionInput,
  ): Promise<void> {
    const { tableId, index } = input;
    const type = this.resolveIndexType(index.type);
    const orders = index.orders?.map((order) => this.resolveIndexOrder(order));

    await runWithRetry(
      () =>
        this.sdk.createIndex({
          databaseId: this.databaseId,
          tableId,
          key: index.key,
          type,
          columns: index.attributes,
          orders,
        }),
      {
        maxAttempts: INDEX_CREATION_MAX_ATTEMPTS,
        retryDelayMs: INDEX_CREATION_RETRY_DELAY_MS,
        shouldRetry: isColumnNotAvailableError,
        sleep: this.sleep,
      },
    );
  }

  private resolveIndexType(
    type: TableBlueprint['indexes'][number]['type'],
  ): IndexType {
    if (type === 'fulltext') {
      return IndexType.Fulltext;
    }

    if (type === 'unique') {
      return IndexType.Unique;
    }

    return IndexType.Key;
  }

  private resolveIndexOrder(order: 'ASC' | 'DESC'): OrderBy {
    if (order === 'DESC') {
      return OrderBy.Desc;
    }

    return OrderBy.Asc;
  }
}
