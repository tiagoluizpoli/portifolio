import type { TableId } from '@repo/appwrite-core';
import type { TablesDB } from 'node-appwrite';
import type {
  LoadRemoteTableStateInput,
  MigrationRemoteTableState,
} from './migration-contracts.js';
import { sortStrings } from './migration-utils.js';

export async function loadRemoteTableState(input: {
  sdk: TablesDB;
  databaseId: string;
  payload: LoadRemoteTableStateInput;
}): Promise<MigrationRemoteTableState> {
  const { sdk, databaseId, payload } = input;
  const { table } = payload;

  const [columnList, indexList] = await Promise.all([
    sdk.listColumns({
      databaseId,
      tableId: table.$id as TableId,
    }),
    sdk.listIndexes({
      databaseId,
      tableId: table.$id as TableId,
    }),
  ]);

  return {
    tableId: table.$id as TableId,
    tableName: table.name,
    columnKeys: sortStrings(columnList.columns.map((column) => column.key)),
    indexKeys: sortStrings(indexList.indexes.map((index) => index.key)),
  };
}
