import { blueprints, type MigrationRemoteState } from '@repo/appwrite';

export interface DestructiveDiscrepancies {
  tables: string[];
  columns: Record<string, string[]>;
  indexes: Record<string, string[]>;
}

function sortUnique(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function sortRecord(
  values: Record<string, string[]>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(values)
      .map(([key, list]) => [key, sortUnique(list)] as const)
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

function tableMap(): Map<
  string,
  { columns: Set<string>; indexes: Set<string> }
> {
  return new Map(
    blueprints.map((table) => [
      table.id,
      {
        columns: new Set(table.columns.map((column) => column.key)),
        indexes: new Set(table.indexes.map((index) => index.key)),
      },
    ]),
  );
}

export class SchemaComparator {
  detectDiscrepancies(input: {
    remoteState: MigrationRemoteState;
  }): DestructiveDiscrepancies {
    const catalog = tableMap();
    const tableDiscrepancies: string[] = [];
    const columnDiscrepancies: Record<string, string[]> = {};
    const indexDiscrepancies: Record<string, string[]> = {};

    for (const remoteTable of input.remoteState.tables) {
      const known = catalog.get(remoteTable.tableId);

      if (!known) {
        tableDiscrepancies.push(remoteTable.tableId);
        continue;
      }

      const unknownColumns = remoteTable.columnKeys.filter(
        (columnKey) => !known.columns.has(columnKey),
      );

      if (unknownColumns.length > 0) {
        columnDiscrepancies[remoteTable.tableId] = sortUnique(unknownColumns);
      }

      const unknownIndexes = remoteTable.indexKeys.filter(
        (indexKey) => !known.indexes.has(indexKey),
      );

      if (unknownIndexes.length > 0) {
        indexDiscrepancies[remoteTable.tableId] = sortUnique(unknownIndexes);
      }
    }

    return {
      tables: sortUnique(tableDiscrepancies),
      columns: sortRecord(columnDiscrepancies),
      indexes: sortRecord(indexDiscrepancies),
    };
  }
}
