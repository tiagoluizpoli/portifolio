import { IndexType, type Models, OrderBy, type TablesDB } from 'node-appwrite';
import { getTablesClient } from '../client.js';
import {
  AppwriteCatastrophicConfigError,
  mapAppwriteError,
} from '../errors/appwrite-errors.js';
import {
  BlueprintsSchema,
  blueprints,
  type ColumnDefinition,
  type TableBlueprint,
} from '../migrations/blueprints.js';

export interface MigrationRemoteTableState {
  tableId: string;
  tableName: string;
  columnKeys: string[];
  indexKeys: string[];
}

export interface MigrationRemoteState {
  tables: MigrationRemoteTableState[];
}

export interface MigrationServiceConfig {
  databaseId?: string;
  tablesClient?: TablesDB;
}

export interface MigrationMissingColumnsByTable {
  tableId: string;
  tableName: string;
  columns: ColumnDefinition[];
}

export interface MigrationStructuralDelta {
  missingTables: TableBlueprint[];
  missingColumns: MigrationMissingColumnsByTable[];
}

export interface MigrationStructuralDeltaInput {
  blueprintSet?: TableBlueprint[];
  remoteState?: MigrationRemoteState;
}

export interface MigrationCreatedColumn {
  tableId: string;
  columnKey: string;
}

export interface MigrationCreatedIndex {
  tableId: string;
  indexKey: string;
}

export interface MigrationApplyResult {
  createdTables: string[];
  createdColumns: MigrationCreatedColumn[];
  createdIndexes: MigrationCreatedIndex[];
}

export interface MigrationApplyInput {
  blueprintSet?: TableBlueprint[];
  remoteState?: MigrationRemoteState;
  destructiveAuthorization?: MigrationDestructiveAuthorization;
}

export interface MigrationDestructiveAuthorization {
  tables?: string[];
  columns?: Record<string, string[]>;
  indexes?: Record<string, string[]>;
}

interface LoadRemoteTableStateInput {
  table: Models.Table;
}

interface CreateColumnDefinitionInput {
  tableId: string;
  column: ColumnDefinition;
}

interface CreateIndexDefinitionInput {
  tableId: string;
  index: TableBlueprint['indexes'][number];
}

interface ApplyAuthorizedDestructiveChangesInput {
  blueprintSet: TableBlueprint[];
  remoteState: MigrationRemoteState;
  authorization?: MigrationDestructiveAuthorization;
}

export interface IMigrationService {
  loadRemoteState(): Promise<MigrationRemoteState>;
  calculateStructuralDelta(
    input?: MigrationStructuralDeltaInput,
  ): Promise<MigrationStructuralDelta>;
  migrate(input?: MigrationApplyInput): Promise<MigrationApplyResult>;
}

function resolveDatabaseId(configDatabaseId?: string): string {
  if (configDatabaseId) {
    return configDatabaseId;
  }

  const value = process.env.APPWRITE_DATABASE_ID;
  if (!value) {
    throw new AppwriteCatastrophicConfigError(
      'Missing required APPWRITE_DATABASE_ID',
    );
  }

  return value;
}

function sortStrings(values: string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function sortMissingColumns(
  values: MigrationMissingColumnsByTable[],
): MigrationMissingColumnsByTable[] {
  return [...values].sort((left, right) =>
    left.tableId.localeCompare(right.tableId),
  );
}

function resolveBlueprintSet(input?: TableBlueprint[]): TableBlueprint[] {
  if (input) {
    return BlueprintsSchema.parse(input);
  }

  return blueprints;
}

function resolveColumnDefault(
  column: ColumnDefinition,
): string | number | boolean | undefined {
  // Appwrite rejects defaults for required columns.
  if (column.required) {
    return undefined;
  }

  if (
    typeof column.default === 'string' ||
    typeof column.default === 'number' ||
    typeof column.default === 'boolean'
  ) {
    return column.default;
  }

  return undefined;
}

export class MigrationService implements IMigrationService {
  private readonly databaseId: string;
  private readonly sdk: TablesDB;

  constructor(config: MigrationServiceConfig = {}) {
    this.databaseId = resolveDatabaseId(config.databaseId);
    this.sdk = config.tablesClient ?? getTablesClient();
  }

  async loadRemoteState(): Promise<MigrationRemoteState> {
    try {
      const tableList = await this.sdk.listTables({
        databaseId: this.databaseId,
      });

      const tables = await Promise.all(
        tableList.tables.map((table) => this.loadRemoteTableState({ table })),
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

    const remoteTablesById = new Map<string, MigrationRemoteTableState>(
      remoteState.tables.map((table) => [table.tableId, table]),
    );

    const missingTables: TableBlueprint[] = [];
    const missingColumns: MigrationMissingColumnsByTable[] = [];

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

      const createdTables: string[] = [];
      const createdColumns: MigrationCreatedColumn[] = [];
      const createdIndexes: MigrationCreatedIndex[] = [];

      const remoteTablesById = new Map<string, MigrationRemoteTableState>(
        remoteState.tables.map((table) => [table.tableId, table]),
      );

      for (const table of delta.missingTables) {
        await this.sdk.createTable({
          databaseId: this.databaseId,
          tableId: table.id,
          name: table.name,
        });

        createdTables.push(table.id);

        for (const column of table.columns) {
          await this.createColumnDefinition({
            tableId: table.id,
            column,
          });

          createdColumns.push({ tableId: table.id, columnKey: column.key });
        }

        for (const index of table.indexes) {
          await this.createIndexDefinition({
            tableId: table.id,
            index,
          });

          createdIndexes.push({ tableId: table.id, indexKey: index.key });
        }
      }

      for (const missing of delta.missingColumns) {
        for (const column of missing.columns) {
          await this.createColumnDefinition({
            tableId: missing.tableId,
            column,
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

          await this.createIndexDefinition({
            tableId: table.id,
            index,
          });

          createdIndexes.push({ tableId: table.id, indexKey: index.key });
        }
      }

      await this.applyAuthorizedDestructiveChanges({
        blueprintSet,
        remoteState,
        authorization: input.destructiveAuthorization,
      });

      return {
        createdTables,
        createdColumns,
        createdIndexes,
      };
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }

  private async loadRemoteTableState(
    input: LoadRemoteTableStateInput,
  ): Promise<MigrationRemoteTableState> {
    const { table } = input;

    const [columnList, indexList] = await Promise.all([
      this.sdk.listColumns({
        databaseId: this.databaseId,
        tableId: table.$id,
      }),
      this.sdk.listIndexes({
        databaseId: this.databaseId,
        tableId: table.$id,
      }),
    ]);

    return {
      tableId: table.$id,
      tableName: table.name,
      columnKeys: sortStrings(columnList.columns.map((column) => column.key)),
      indexKeys: sortStrings(indexList.indexes.map((index) => index.key)),
    };
  }

  private async createColumnDefinition(
    input: CreateColumnDefinitionInput,
  ): Promise<void> {
    const { tableId, column } = input;
    const defaultValue = resolveColumnDefault(column);

    if (column.type === 'string') {
      await this.sdk.createStringColumn({
        databaseId: this.databaseId,
        tableId,
        key: column.key,
        size: column.size ?? 255,
        required: column.required,
        xdefault: typeof defaultValue === 'string' ? defaultValue : undefined,
        array: column.array,
      });
      return;
    }

    if (column.type === 'integer') {
      await this.sdk.createIntegerColumn({
        databaseId: this.databaseId,
        tableId,
        key: column.key,
        required: column.required,
        xdefault:
          typeof defaultValue === 'number'
            ? Math.trunc(defaultValue)
            : undefined,
        array: column.array,
      });
      return;
    }

    if (column.type === 'float') {
      await this.sdk.createFloatColumn({
        databaseId: this.databaseId,
        tableId,
        key: column.key,
        required: column.required,
        xdefault: typeof defaultValue === 'number' ? defaultValue : undefined,
        array: column.array,
      });
      return;
    }

    if (column.type === 'boolean') {
      await this.sdk.createBooleanColumn({
        databaseId: this.databaseId,
        tableId,
        key: column.key,
        required: column.required,
        xdefault: typeof defaultValue === 'boolean' ? defaultValue : undefined,
        array: column.array,
      });
      return;
    }

    if (column.type === 'datetime') {
      await this.sdk.createDatetimeColumn({
        databaseId: this.databaseId,
        tableId,
        key: column.key,
        required: column.required,
        xdefault: typeof defaultValue === 'string' ? defaultValue : undefined,
        array: column.array,
      });
      return;
    }

    if (column.type === 'email') {
      await this.sdk.createEmailColumn({
        databaseId: this.databaseId,
        tableId,
        key: column.key,
        required: column.required,
        xdefault: typeof defaultValue === 'string' ? defaultValue : undefined,
        array: column.array,
      });
      return;
    }

    if (column.type === 'enum') {
      await this.sdk.createEnumColumn({
        databaseId: this.databaseId,
        tableId,
        key: column.key,
        elements: column.elements ?? [],
        required: column.required,
        xdefault: typeof defaultValue === 'string' ? defaultValue : undefined,
        array: column.array,
      });
      return;
    }

    if (column.type === 'url') {
      await this.sdk.createUrlColumn({
        databaseId: this.databaseId,
        tableId,
        key: column.key,
        required: column.required,
        xdefault: typeof defaultValue === 'string' ? defaultValue : undefined,
        array: column.array,
      });
      return;
    }

    await this.sdk.createIpColumn({
      databaseId: this.databaseId,
      tableId,
      key: column.key,
      required: column.required,
      xdefault: typeof defaultValue === 'string' ? defaultValue : undefined,
      array: column.array,
    });
  }

  private async createIndexDefinition(
    input: CreateIndexDefinitionInput,
  ): Promise<void> {
    const { tableId, index } = input;
    const type = this.resolveIndexType(index.type);
    const orders = index.orders?.map((order) => this.resolveIndexOrder(order));

    await this.sdk.createIndex({
      databaseId: this.databaseId,
      tableId,
      key: index.key,
      type,
      columns: index.attributes,
      orders,
    });
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

  private async applyAuthorizedDestructiveChanges(
    input: ApplyAuthorizedDestructiveChangesInput,
  ): Promise<void> {
    const { blueprintSet, remoteState, authorization } = input;

    if (!authorization) {
      return;
    }

    const blueprintTableById = new Map(
      blueprintSet.map((table) => [table.id, table]),
    );
    const remoteTableById = new Map(
      remoteState.tables.map((table) => [table.tableId, table]),
    );
    const deletedTables = new Set<string>();

    const authorizedTables = [...new Set(authorization.tables ?? [])].sort(
      (left, right) => left.localeCompare(right),
    );

    for (const tableId of authorizedTables) {
      if (blueprintTableById.has(tableId)) {
        continue;
      }

      if (!remoteTableById.has(tableId)) {
        continue;
      }

      await this.sdk.deleteTable({
        databaseId: this.databaseId,
        tableId,
      });

      deletedTables.add(tableId);
    }

    const authorizedColumns = Object.entries(authorization.columns ?? {}).sort(
      ([left], [right]) => left.localeCompare(right),
    );

    for (const [tableId, columnKeys] of authorizedColumns) {
      if (deletedTables.has(tableId)) {
        continue;
      }

      const remoteTable = remoteTableById.get(tableId);
      if (!remoteTable) {
        continue;
      }

      const remoteColumnSet = new Set(remoteTable.columnKeys);
      const blueprintColumnSet = new Set(
        (blueprintTableById.get(tableId)?.columns ?? []).map(
          (column) => column.key,
        ),
      );

      const sortedColumns = [...new Set(columnKeys)].sort((left, right) =>
        left.localeCompare(right),
      );

      for (const columnKey of sortedColumns) {
        if (!remoteColumnSet.has(columnKey)) {
          continue;
        }

        if (blueprintColumnSet.has(columnKey)) {
          continue;
        }

        await this.sdk.deleteColumn({
          databaseId: this.databaseId,
          tableId,
          key: columnKey,
        });
      }
    }

    const authorizedIndexes = Object.entries(authorization.indexes ?? {}).sort(
      ([left], [right]) => left.localeCompare(right),
    );

    for (const [tableId, indexKeys] of authorizedIndexes) {
      if (deletedTables.has(tableId)) {
        continue;
      }

      const remoteTable = remoteTableById.get(tableId);
      if (!remoteTable) {
        continue;
      }

      const remoteIndexSet = new Set(remoteTable.indexKeys);
      const blueprintIndexSet = new Set(
        (blueprintTableById.get(tableId)?.indexes ?? []).map(
          (index) => index.key,
        ),
      );

      const sortedIndexes = [...new Set(indexKeys)].sort((left, right) =>
        left.localeCompare(right),
      );

      for (const indexKey of sortedIndexes) {
        if (!remoteIndexSet.has(indexKey)) {
          continue;
        }

        if (blueprintIndexSet.has(indexKey)) {
          continue;
        }

        await this.sdk.deleteIndex({
          databaseId: this.databaseId,
          tableId,
          key: indexKey,
        });
      }
    }
  }
}
