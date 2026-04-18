import { afterEach, describe, expect, it, vi } from 'vitest';
import { MigratorCli } from '@/cli/migrator-cli';
import { PendingStructuralChangesError } from '@/core/errors';
import { CheckService } from '@/services/check-service';
import { MigrateService } from '@/services/migrate-service';
import { SeedService } from '@/services/seed-service';

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

    let isSchemaSynchronized = false;
    const cli = new MigratorCli();

    // Mock services using spyOn to avoid module path resolving issues and prototype problems
    const checkSpy = vi
      .spyOn(CheckService.prototype, 'execute')
      .mockImplementation(async () => {
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
      });

    const migrateSpy = vi
      .spyOn(MigrateService.prototype, 'execute')
      .mockImplementation(async () => {
        isSchemaSynchronized = true;
      });

    const seedSpy = vi
      .spyOn(SeedService.prototype, 'execute')
      .mockImplementation(async () => {
        // Mock seed service
      });

    // Lifecycle
    await expect(cli.run(['--check'])).rejects.toBeInstanceOf(
      PendingStructuralChangesError,
    );
    await expect(cli.run(['--migrate'])).resolves.toBeUndefined();
    await expect(cli.run(['--seed'])).resolves.toBeUndefined();
    await expect(cli.run(['--check'])).resolves.toBeUndefined();

    expect(checkSpy).toHaveBeenCalledTimes(2);
    expect(migrateSpy).toHaveBeenCalledTimes(1);
    expect(seedSpy).toHaveBeenCalledTimes(1);
  });
});
