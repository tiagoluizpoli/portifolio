import type { TablesDB } from 'node-appwrite';
import { beforeEach, vi } from 'vitest';

export interface MigrationTablesClientMock {
  listTables: ReturnType<typeof vi.fn>;
  listColumns: ReturnType<typeof vi.fn>;
  listIndexes: ReturnType<typeof vi.fn>;
  createTable: ReturnType<typeof vi.fn>;
  createStringColumn: ReturnType<typeof vi.fn>;
  createTextColumn: ReturnType<typeof vi.fn>;
  createIntegerColumn: ReturnType<typeof vi.fn>;
  createFloatColumn: ReturnType<typeof vi.fn>;
  createBooleanColumn: ReturnType<typeof vi.fn>;
  createDatetimeColumn: ReturnType<typeof vi.fn>;
  createEmailColumn: ReturnType<typeof vi.fn>;
  createEnumColumn: ReturnType<typeof vi.fn>;
  createUrlColumn: ReturnType<typeof vi.fn>;
  createIpColumn: ReturnType<typeof vi.fn>;
  createIndex: ReturnType<typeof vi.fn>;
  deleteTable: ReturnType<typeof vi.fn>;
  deleteColumn: ReturnType<typeof vi.fn>;
  deleteIndex: ReturnType<typeof vi.fn>;
}

export interface ListByTableIdInput {
  tableId: string;
}

export interface InvalidBlueprintFixture {
  id: string;
  name: string;
  uniqueLogicKeys: Record<string, string[]>;
  columns: Array<Record<string, unknown>>;
  indexes: Array<Record<string, unknown>>;
}

let tablesClientMock: MigrationTablesClientMock;
export const getTablesClientMock = vi.fn(() => tablesClientMock);

export function asTablesClient(input: MigrationTablesClientMock): TablesDB {
  return input as unknown as TablesDB;
}

export function setupMigrationServiceTest(): void {
  beforeEach(() => {
    getTablesClientMock.mockClear();
    tablesClientMock = {
      listTables: vi.fn(),
      listColumns: vi.fn(),
      listIndexes: vi.fn(),
      createTable: vi.fn(),
      createStringColumn: vi.fn(),
      createTextColumn: vi.fn(),
      createIntegerColumn: vi.fn(),
      createFloatColumn: vi.fn(),
      createBooleanColumn: vi.fn(),
      createDatetimeColumn: vi.fn(),
      createEmailColumn: vi.fn(),
      createEnumColumn: vi.fn(),
      createUrlColumn: vi.fn(),
      createIpColumn: vi.fn(),
      createIndex: vi.fn(),
      deleteTable: vi.fn(),
      deleteColumn: vi.fn(),
      deleteIndex: vi.fn(),
    };

    process.env.APPWRITE_DATABASE_ID = 'db-main';
  });
}

export function currentTablesClientMock(): MigrationTablesClientMock {
  return tablesClientMock;
}
