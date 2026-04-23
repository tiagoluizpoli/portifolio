import type { TableId } from '@repo/appwrite-core';
import type { TablesDB } from 'node-appwrite';
import type {
  ApplyAuthorizedDestructiveChangesInput,
  MigrationRemoteState,
} from './migration-contracts.js';

function sortAndDeduplicate(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export async function applyAuthorizedDestructiveChanges(input: {
  sdk: TablesDB;
  databaseId: string;
  payload: ApplyAuthorizedDestructiveChangesInput;
}): Promise<void> {
  const { sdk, databaseId, payload } = input;
  const { blueprintSet, remoteState, authorization } = payload;

  if (!authorization) {
    return;
  }

  const blueprintTableById = new Map(
    blueprintSet.map((table) => [table.id, table]),
  );
  const remoteTableById = new Map<TableId, (typeof remoteState.tables)[number]>(
    remoteState.tables.map((table) => [table.tableId, table]),
  );
  const deletedTables = new Set<TableId>();

  for (const tableId of sortAndDeduplicate(
    authorization.tables ?? [],
  ) as TableId[]) {
    if (blueprintTableById.has(tableId) || !remoteTableById.has(tableId)) {
      continue;
    }

    await sdk.deleteTable({ databaseId, tableId });
    deletedTables.add(tableId);
  }

  const authorizedColumns = Object.entries(authorization.columns ?? {}).sort(
    ([left], [right]) => left.localeCompare(right),
  );

  for (const [rawTableId, columnKeys] of authorizedColumns) {
    const tableId = rawTableId as TableId;
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

    for (const columnKey of sortAndDeduplicate(columnKeys)) {
      if (
        !remoteColumnSet.has(columnKey) ||
        blueprintColumnSet.has(columnKey)
      ) {
        continue;
      }

      await sdk.deleteColumn({
        databaseId,
        tableId,
        key: columnKey,
      });
    }
  }

  const authorizedIndexes = Object.entries(authorization.indexes ?? {}).sort(
    ([left], [right]) => left.localeCompare(right),
  );

  for (const [rawTableId, indexKeys] of authorizedIndexes) {
    const tableId = rawTableId as TableId;
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

    for (const indexKey of sortAndDeduplicate(indexKeys)) {
      if (!remoteIndexSet.has(indexKey) || blueprintIndexSet.has(indexKey)) {
        continue;
      }

      await sdk.deleteIndex({
        databaseId,
        tableId,
        key: indexKey,
      });
    }
  }
}

export function buildRemoteTableMap(
  remoteState: MigrationRemoteState,
): Map<TableId, MigrationRemoteState['tables'][number]> {
  return new Map(remoteState.tables.map((table) => [table.tableId, table]));
}
