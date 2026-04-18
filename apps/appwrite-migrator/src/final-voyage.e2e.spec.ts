import { type AboutInsert, AboutInsertSchema } from '@repo/appwrite';
import { afterEach, describe, expect, it } from 'vitest';
import {
  type MigratorModeHandlers,
  PendingStructuralChangesError,
  runFromEnvironment,
} from './index.js';
import { SeederService } from './services/seeder.js';

const trackedEnvKeys = [
  'MIGRATOR_MODE',
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT_ID',
  'APPWRITE_API_KEY',
  'APPWRITE_DATABASE_ID',
  'APPWRITE_CURATOR_TEAM_ID',
] as const;

const originalEnvByKey = new Map<string, string | undefined>(
  trackedEnvKeys.map((key) => [key, process.env[key]]),
);

function restoreTrackedEnv(): void {
  for (const key of trackedEnvKeys) {
    const originalValue = originalEnvByKey.get(key);

    if (originalValue === undefined) {
      delete process.env[key];
      continue;
    }

    process.env[key] = originalValue;
  }
}

function setRequiredAppwriteEnv(): void {
  process.env.APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
  process.env.APPWRITE_PROJECT_ID = 'project-id';
  process.env.APPWRITE_API_KEY = 'secret-api-key';
  process.env.APPWRITE_DATABASE_ID = 'database-id';
  process.env.APPWRITE_CURATOR_TEAM_ID = 'curator-team-id';
  process.env.MIGRATOR_MODE = 'check';
}

describe('Final Voyage E2E', () => {
  afterEach(() => {
    restoreTrackedEnv();
  });

  it('tracks full lifecycle and preserves SC-003 zero duplicates', async () => {
    setRequiredAppwriteEnv();

    const seeder = new SeederService();
    const validatedRows = seeder.validateRows({
      about: [
        {
          name: 'Tiago',
          title: 'Engineer',
          bio: 'Building clean systems',
          locale: 'en',
        },
        {
          name: 'Tiago',
          title: 'Engenheiro',
          bio: 'Construindo sistemas limpos',
          locale: 'pt',
        },
      ],
    });

    const seededAboutRows: Array<AboutInsert & { id: string }> = [];
    let createCounter = 0;
    let isSchemaSynchronized = false;

    const handlers: MigratorModeHandlers = {
      check: async () => {
        if (!isSchemaSynchronized) {
          throw new PendingStructuralChangesError({
            missingTables: [],
            missingColumns: [
              {
                tableId: 'about',
                tableName: 'About',
                columns: [
                  { key: 'name', type: 'string', required: true, size: 255 },
                ],
              },
            ],
          });
        }
      },
      migrate: async () => {
        isSchemaSynchronized = true;
      },
      seed: async () => {
        const plan = seeder.buildUpsertPlan({
          validatedRows,
          existingRows: {
            about: seededAboutRows.map((row) => ({ ...row })),
          },
        });

        await seeder.executeUpsertPlan({
          plan,
          executeOperation: async (operation) => {
            if (operation.tableId !== 'about') {
              return;
            }

            if (operation.action === 'create') {
              const row = AboutInsertSchema.parse(operation.data);
              createCounter += 1;
              seededAboutRows.push({
                id: `about-${createCounter}`,
                ...row,
              });
              return;
            }

            if (operation.action === 'update' && operation.rowId) {
              const row = AboutInsertSchema.parse(operation.data);
              const target = seededAboutRows.find(
                (item) => item.id === operation.rowId,
              );

              if (target) {
                Object.assign(target, row);
              }
            }
          },
        });
      },
      template: async () => {},
    };

    await expect(
      runFromEnvironment(handlers, ['--check']),
    ).rejects.toBeInstanceOf(PendingStructuralChangesError);

    await expect(
      runFromEnvironment(handlers, ['--migrate']),
    ).resolves.toBeUndefined();

    await expect(
      runFromEnvironment(handlers, ['--seed']),
    ).resolves.toBeUndefined();

    await expect(
      runFromEnvironment(handlers, ['--seed']),
    ).resolves.toBeUndefined();

    await expect(
      runFromEnvironment(handlers, ['--check']),
    ).resolves.toBeUndefined();

    expect(seededAboutRows).toHaveLength(2);
    expect(
      new Set(seededAboutRows.map((row) => `${row.name}:${row.locale}`)).size,
    ).toBe(2);
  });
});
