import type { TablesDB } from 'node-appwrite';
import type { CreateColumnDefinitionInput } from './migration-contracts.js';
import { resolveColumnDefault } from './migration-utils.js';

export async function createColumnDefinition(input: {
  sdk: TablesDB;
  databaseId: string;
  payload: CreateColumnDefinitionInput;
}): Promise<void> {
  const { sdk, databaseId, payload } = input;
  const { tableId, column } = payload;
  const defaultValue = resolveColumnDefault(column);

  if (column.type === 'string') {
    await sdk.createTextColumn({
      databaseId,
      tableId,
      key: column.key,
      required: column.required,
      xdefault: typeof defaultValue === 'string' ? defaultValue : undefined,
      array: column.array,
    });
    return;
  }

  if (column.type === 'integer') {
    await sdk.createIntegerColumn({
      databaseId,
      tableId,
      key: column.key,
      required: column.required,
      xdefault:
        typeof defaultValue === 'number' ? Math.trunc(defaultValue) : undefined,
      array: column.array,
    });
    return;
  }

  if (column.type === 'float') {
    await sdk.createFloatColumn({
      databaseId,
      tableId,
      key: column.key,
      required: column.required,
      xdefault: typeof defaultValue === 'number' ? defaultValue : undefined,
      array: column.array,
    });
    return;
  }

  if (column.type === 'boolean') {
    await sdk.createBooleanColumn({
      databaseId,
      tableId,
      key: column.key,
      required: column.required,
      xdefault: typeof defaultValue === 'boolean' ? defaultValue : undefined,
      array: column.array,
    });
    return;
  }

  if (column.type === 'datetime') {
    await sdk.createDatetimeColumn({
      databaseId,
      tableId,
      key: column.key,
      required: column.required,
      xdefault: typeof defaultValue === 'string' ? defaultValue : undefined,
      array: column.array,
    });
    return;
  }

  if (column.type === 'email') {
    await sdk.createEmailColumn({
      databaseId,
      tableId,
      key: column.key,
      required: column.required,
      xdefault: typeof defaultValue === 'string' ? defaultValue : undefined,
      array: column.array,
    });
    return;
  }

  if (column.type === 'enum') {
    await sdk.createEnumColumn({
      databaseId,
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
    await sdk.createUrlColumn({
      databaseId,
      tableId,
      key: column.key,
      required: column.required,
      xdefault: typeof defaultValue === 'string' ? defaultValue : undefined,
      array: column.array,
    });
    return;
  }

  await sdk.createIpColumn({
    databaseId,
    tableId,
    key: column.key,
    required: column.required,
    xdefault: typeof defaultValue === 'string' ? defaultValue : undefined,
    array: column.array,
  });
}
