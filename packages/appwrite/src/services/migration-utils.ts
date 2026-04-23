import { AppwriteCatastrophicConfigError } from '../errors/appwrite-errors.js';
import {
  BlueprintsSchema,
  blueprints,
  type ColumnDefinition,
  type TableBlueprint,
} from '../migrations/blueprints.js';
import type { MigrationMissingColumnsByTable } from './migration-contracts.js';

export function resolveDatabaseId(configDatabaseId?: string): string {
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

export function sortStrings(values: string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

export function sortMissingColumns(
  values: MigrationMissingColumnsByTable[],
): MigrationMissingColumnsByTable[] {
  return [...values].sort((left, right) =>
    left.tableId.localeCompare(right.tableId),
  );
}

export function resolveBlueprintSet(
  input?: TableBlueprint[],
): TableBlueprint[] {
  if (input) {
    return BlueprintsSchema.parse(input);
  }

  return blueprints;
}

export function resolveColumnDefault(
  column: ColumnDefinition,
): string | number | boolean | undefined {
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
