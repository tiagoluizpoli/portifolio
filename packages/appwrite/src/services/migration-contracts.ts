import type { TableId } from '@repo/appwrite-core';
import type { Models, TablesDB } from 'node-appwrite';
import type {
  ColumnDefinition,
  TableBlueprint,
} from '../migrations/blueprints.js';

export interface MigrationRemoteTableState {
  tableId: TableId;
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
  tableId: TableId;
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
  tableId: TableId;
  columnKey: string;
}

export interface MigrationCreatedIndex {
  tableId: TableId;
  indexKey: string;
}

export interface MigrationApplyResult {
  createdTables: TableId[];
  createdColumns: MigrationCreatedColumn[];
  createdIndexes: MigrationCreatedIndex[];
}

export interface MigrationApplyInput {
  blueprintSet?: TableBlueprint[];
  remoteState?: MigrationRemoteState;
  destructiveAuthorization?: MigrationDestructiveAuthorization;
}

export interface MigrationDestructiveAuthorization {
  tables?: TableId[];
  columns?: Record<TableId, string[]>;
  indexes?: Record<TableId, string[]>;
}

export interface LoadRemoteTableStateInput {
  table: Models.Table;
}

export interface CreateColumnDefinitionInput {
  tableId: TableId;
  column: ColumnDefinition;
}

export interface CreateIndexDefinitionInput {
  tableId: TableId;
  index: TableBlueprint['indexes'][number];
}

export interface ApplyAuthorizedDestructiveChangesInput {
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
