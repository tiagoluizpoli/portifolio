import { blueprints, type MigrationRemoteState } from '@repo/appwrite';
import { z } from 'zod';

export const DESTRUCTIVE_STATE_FILE_NAME = 'destructive-state.json';

const boolRecordSchema = z.record(z.string().min(1), z.boolean());
const nestedBoolRecordSchema = z.record(z.string().min(1), boolRecordSchema);

const destructiveStateSchema = z.object({
  version: z.literal(1),
  updatedAt: z.string().min(1),
  tables: boolRecordSchema,
  columns: nestedBoolRecordSchema,
  indexes: nestedBoolRecordSchema,
});

export type DestructiveState = z.infer<typeof destructiveStateSchema>;

export interface DestructiveDiscrepancies {
  tables: string[];
  columns: Record<string, string[]>;
  indexes: Record<string, string[]>;
}

export interface DestructiveAuthorization {
  tables: string[];
  columns: Record<string, string[]>;
  indexes: Record<string, string[]>;
}

export interface DestructiveStateStore {
  read(input: { fileName: string }): Promise<string | null>;
  write(input: { fileName: string; content: string }): Promise<void>;
}

export interface DestructiveOfficerSyncResult {
  discrepancies: DestructiveDiscrepancies;
  state: DestructiveState;
  authorized: DestructiveAuthorization;
}

export class DestructiveStateParseError extends Error {
  constructor() {
    super('Unable to parse destructive-state.json content.');
    this.name = 'DestructiveStateParseError';
  }
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

function emptyState(timestamp: string): DestructiveState {
  return {
    version: 1,
    updatedAt: timestamp,
    tables: {},
    columns: {},
    indexes: {},
  };
}

function cloneNestedBoolRecord(
  input: Record<string, Record<string, boolean>>,
): Record<string, Record<string, boolean>> {
  return Object.fromEntries(
    Object.entries(input).map(([tableId, values]) => [tableId, { ...values }]),
  );
}

function normalizeAuthorization(
  records: Record<string, Record<string, boolean>>,
): Record<string, string[]> {
  const entries = Object.entries(records)
    .map(([tableId, values]) => {
      const allowed = Object.entries(values)
        .filter(([, flag]) => flag)
        .map(([key]) => key);
      return [tableId, sortUnique(allowed)] as const;
    })
    .filter(([, values]) => values.length > 0)
    .sort(([left], [right]) => left.localeCompare(right));

  return Object.fromEntries(entries);
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

export class DestructiveOfficer {
  constructor(private readonly store: DestructiveStateStore) {}

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

  async syncLivingState(input: {
    remoteState: MigrationRemoteState;
    now?: string;
  }): Promise<DestructiveOfficerSyncResult> {
    const now = input.now ?? new Date().toISOString();
    const discrepancies = this.detectDiscrepancies({
      remoteState: input.remoteState,
    });

    const current = await this.readState({ now });

    const nextTables = Object.fromEntries(
      discrepancies.tables.map((tableId) => [
        tableId,
        current.tables[tableId] ?? false,
      ]),
    );

    const nextColumns = Object.fromEntries(
      Object.entries(discrepancies.columns).map(([tableId, columnKeys]) => [
        tableId,
        Object.fromEntries(
          columnKeys.map((columnKey) => [
            columnKey,
            current.columns[tableId]?.[columnKey] ?? false,
          ]),
        ),
      ]),
    );

    const nextIndexes = Object.fromEntries(
      Object.entries(discrepancies.indexes).map(([tableId, indexKeys]) => [
        tableId,
        Object.fromEntries(
          indexKeys.map((indexKey) => [
            indexKey,
            current.indexes[tableId]?.[indexKey] ?? false,
          ]),
        ),
      ]),
    );

    const state: DestructiveState = {
      version: 1,
      updatedAt: now,
      tables: nextTables,
      columns: nextColumns,
      indexes: nextIndexes,
    };

    await this.writeState(state);

    return {
      discrepancies,
      state,
      authorized: this.getAuthorizedEntries({ state, discrepancies }),
    };
  }

  getAuthorizedEntries(input: {
    state: DestructiveState;
    discrepancies: DestructiveDiscrepancies;
  }): DestructiveAuthorization {
    const tableSet = new Set(input.discrepancies.tables);
    const authorizedTables = Object.entries(input.state.tables)
      .filter(([tableId, enabled]) => enabled && tableSet.has(tableId))
      .map(([tableId]) => tableId)
      .sort((left, right) => left.localeCompare(right));

    const authorizedColumns = normalizeAuthorization(input.state.columns);
    const authorizedIndexes = normalizeAuthorization(input.state.indexes);

    return {
      tables: authorizedTables,
      columns: authorizedColumns,
      indexes: authorizedIndexes,
    };
  }

  pruneApplied(input: {
    state: DestructiveState;
    applied: DestructiveAuthorization;
    now?: string;
  }): DestructiveState {
    const now = input.now ?? new Date().toISOString();
    const tables = { ...input.state.tables };
    const columns = cloneNestedBoolRecord(input.state.columns);
    const indexes = cloneNestedBoolRecord(input.state.indexes);

    for (const tableId of input.applied.tables) {
      delete tables[tableId];
    }

    for (const [tableId, keys] of Object.entries(input.applied.columns)) {
      for (const key of keys) {
        delete columns[tableId]?.[key];
      }

      if (columns[tableId] && Object.keys(columns[tableId]).length === 0) {
        delete columns[tableId];
      }
    }

    for (const [tableId, keys] of Object.entries(input.applied.indexes)) {
      for (const key of keys) {
        delete indexes[tableId]?.[key];
      }

      if (indexes[tableId] && Object.keys(indexes[tableId]).length === 0) {
        delete indexes[tableId];
      }
    }

    return {
      version: 1,
      updatedAt: now,
      tables,
      columns,
      indexes,
    };
  }

  async persistState(input: { state: DestructiveState }): Promise<void> {
    await this.writeState(input.state);
  }

  private async readState(input: { now: string }): Promise<DestructiveState> {
    const raw = await this.store.read({
      fileName: DESTRUCTIVE_STATE_FILE_NAME,
    });

    if (raw === null) {
      return emptyState(input.now);
    }

    try {
      return destructiveStateSchema.parse(JSON.parse(raw));
    } catch {
      throw new DestructiveStateParseError();
    }
  }

  private async writeState(state: DestructiveState): Promise<void> {
    await this.store.write({
      fileName: DESTRUCTIVE_STATE_FILE_NAME,
      content: JSON.stringify(state, null, 2),
    });
  }
}
