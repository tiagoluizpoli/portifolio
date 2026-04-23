import { blueprints } from '@repo/appwrite';
import type { TableId } from '@repo/appwrite-core';
import {
  rowSchemaByTable,
  type SeedTableId,
  type ValidatedSeedPayload,
} from './seeder-validator';
import type {
  ExistingSeedRow,
  ExistingSeedState,
  SeedUpsertAction,
  SeedUpsertOperation,
  SeedUpsertPlan,
} from '@/services/seeder';

export interface SeedDeduplicationConflict {
  tableId: SeedTableId;
  rowIndex: number;
  key: string;
  fields: string[];
  values: Record<string, unknown>;
  matchingIds: string[];
}

export class SeedDeduplicationError extends Error {
  readonly conflicts: SeedDeduplicationConflict[];

  constructor(conflicts: SeedDeduplicationConflict[]) {
    super(`Seed deduplication failed with ${conflicts.length} conflict(s).`);
    this.name = 'SeedDeduplicationError';
    this.conflicts = conflicts;
  }
}

const blueprintById = new Map(blueprints.map((table) => [table.id, table]));

function toSeedRowRecord(
  row: ValidatedSeedPayload[SeedTableId][number],
): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row));
}

function valuesEqual(left: unknown, right: unknown): boolean {
  if (left === right) {
    return true;
  }

  return JSON.stringify(left) === JSON.stringify(right);
}

function hasRowChanges(
  existing: ExistingSeedRow,
  incoming: Record<string, unknown>,
): boolean {
  for (const [key, value] of Object.entries(incoming)) {
    if (!valuesEqual(existing[key], value)) {
      return true;
    }
  }

  return false;
}

function resolveBatchSignature(
  tableId: SeedTableId,
  row: Record<string, unknown>,
): { key: string; value: string } | null {
  const tableBlueprint = blueprintById.get(tableId as TableId);

  if (!tableBlueprint) {
    return null;
  }

  for (const [key, fields] of Object.entries(tableBlueprint.uniqueLogicKeys)) {
    if (fields.some((field) => row[field] === undefined)) {
      continue;
    }

    const signature = fields
      .map((field) => `${field}:${JSON.stringify(row[field])}`)
      .join('|');

    return {
      key,
      value: `${key}:${signature}`,
    };
  }

  return null;
}

function findUniqueMatch(
  tableId: SeedTableId,
  rowIndex: number,
  row: Record<string, unknown>,
  existingRows: ExistingSeedRow[],
): {
  matchedId?: string;
  matchedBy?: string;
  conflict?: SeedDeduplicationConflict;
} {
  const tableBlueprint = blueprintById.get(tableId as TableId);

  if (!tableBlueprint) {
    return {};
  }

  const matches = new Map<
    string,
    { key: string; fields: string[]; values: Record<string, unknown> }
  >();

  for (const [key, fields] of Object.entries(tableBlueprint.uniqueLogicKeys)) {
    if (fields.some((field) => row[field] === undefined)) {
      continue;
    }

    const matched = existingRows.filter((existing) =>
      fields.every((field) => valuesEqual(existing[field], row[field])),
    );

    for (const match of matched) {
      const values = Object.fromEntries(
        fields.map((field) => [field, row[field]]),
      );
      matches.set(match.id, { key, fields, values });
    }
  }

  if (matches.size === 0) {
    return {};
  }

  if (matches.size > 1) {
    const first = matches.values().next().value as {
      key: string;
      fields: string[];
      values: Record<string, unknown>;
    };

    return {
      conflict: {
        tableId,
        rowIndex,
        key: first.key,
        fields: first.fields,
        values: first.values,
        matchingIds: [...matches.keys()],
      },
    };
  }

  const [matchedId, matchedData] = [...matches.entries()][0];

  return {
    matchedId,
    matchedBy: matchedData.key,
  };
}

export class SeederPlanner {
  buildUpsertPlan(input: {
    validatedRows: ValidatedSeedPayload;
    existingRows?: ExistingSeedState;
  }): SeedUpsertPlan {
    const operations: SeedUpsertOperation[] = [];
    const conflicts: SeedDeduplicationConflict[] = [];

    for (const tableId of Object.keys(rowSchemaByTable) as SeedTableId[]) {
      const rows = input.validatedRows[tableId];
      const remoteRows = [...(input.existingRows?.[tableId] ?? [])];
      const seenSignatures = new Set<string>();

      rows.forEach((row, rowIndex) => {
        const rowData = toSeedRowRecord(row);
        const signature = resolveBatchSignature(tableId, rowData);

        if (signature && seenSignatures.has(signature.value)) {
          operations.push({
            tableId,
            rowIndex,
            action: 'ignore',
            data: rowData,
            matchedBy: signature.key,
          });
          return;
        }

        if (signature) {
          seenSignatures.add(signature.value);
        }

        const match = findUniqueMatch(tableId, rowIndex, rowData, remoteRows);

        if (match.conflict) {
          conflicts.push(match.conflict);
          return;
        }

        if (!match.matchedId) {
          operations.push({
            tableId,
            rowIndex,
            action: 'create',
            data: rowData,
            matchedBy: signature?.key,
          });
          remoteRows.push({
            id: `planned_${tableId}_${rowIndex}`,
            ...rowData,
          });
          return;
        }

        const existing = remoteRows.find((item) => item.id === match.matchedId);

        if (!existing) {
          operations.push({
            tableId,
            rowIndex,
            action: 'create',
            data: rowData,
            matchedBy: signature?.key,
          });
          return;
        }

        if (hasRowChanges(existing, rowData)) {
          operations.push({
            tableId,
            rowIndex,
            action: 'update',
            data: rowData,
            rowId: existing.id,
            matchedBy: match.matchedBy,
          });

          Object.assign(existing, rowData);
          return;
        }

        operations.push({
          tableId,
          rowIndex,
          action: 'ignore',
          data: rowData,
          rowId: existing.id,
          matchedBy: match.matchedBy,
        });
      });
    }

    if (conflicts.length > 0) {
      throw new SeedDeduplicationError(conflicts);
    }

    const summary: Record<SeedUpsertAction, number> = {
      create: 0,
      update: 0,
      ignore: 0,
    };

    for (const operation of operations) {
      summary[operation.action] += 1;
    }

    return {
      operations,
      summary,
    };
  }
}
