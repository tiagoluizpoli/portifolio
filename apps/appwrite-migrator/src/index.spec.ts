import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { MigrationStructuralDelta, TablesDB } from '@repo/appwrite';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ConflictingMigratorCliFlagsError,
  dispatchMigratorMode,
  hasPendingStructuralChanges,
  type MigratorModeHandlers,
  MissingTemplateOutputPathError,
  PendingStructuralChangesError,
  resolveModeFromCliArgs,
  resolveTemplateMarkdownOutputPath,
  resolveTemplateOutputPathFromCliArgs,
  runAuditCheck,
  runFromEnvironment,
  runSeedMode,
  runTemplateMode,
} from './index.js';

const trackedEnvKeys = [
  'MIGRATOR_MODE',
  'MIGRATOR_ENV_FILE',
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT_ID',
  'APPWRITE_API_KEY',
  'APPWRITE_DATABASE_ID',
  'APPWRITE_CURATOR_TEAM_ID',
  'SEED_BUCKET_ID',
  'SEED_FILE_NAME',
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
}

function createRuntimeEnvFile(mode: string): {
  path: string;
  cleanup: () => void;
} {
  const dir = mkdtempSync(join(tmpdir(), 'appwrite-migrator-env-'));
  const path = join(dir, '.env.test');

  writeFileSync(
    path,
    [
      'APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1',
      'APPWRITE_PROJECT_ID=project-id',
      'APPWRITE_API_KEY=secret-api-key',
      'APPWRITE_DATABASE_ID=database-id',
      'APPWRITE_CURATOR_TEAM_ID=curator-team-id',
      `MIGRATOR_MODE=${mode}`,
    ].join('\n'),
    'utf8',
  );

  return {
    path,
    cleanup: () => {
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

function createHandlers(): {
  handlers: MigratorModeHandlers;
  calls: {
    check: ReturnType<typeof vi.fn>;
    migrate: ReturnType<typeof vi.fn>;
    seed: ReturnType<typeof vi.fn>;
    template: ReturnType<typeof vi.fn>;
  };
} {
  const calls = {
    check: vi.fn(async () => {}),
    migrate: vi.fn(async () => {}),
    seed: vi.fn(async () => {}),
    template: vi.fn(async () => {}),
  };

  return {
    handlers: {
      check: calls.check,
      migrate: calls.migrate,
      seed: calls.seed,
      template: calls.template,
    },
    calls,
  };
}

describe('appwrite-migrator index dispatcher', () => {
  afterEach(() => {
    restoreTrackedEnv();
  });

  it('routes check mode to check handler only', async () => {
    const { handlers, calls } = createHandlers();

    await dispatchMigratorMode({
      mode: 'check',
      handlers,
    });

    expect(calls.check).toHaveBeenCalledTimes(1);
    expect(calls.migrate).not.toHaveBeenCalled();
    expect(calls.seed).not.toHaveBeenCalled();
    expect(calls.template).not.toHaveBeenCalled();
  });

  it('routes migrate mode to migrate handler only', async () => {
    const { handlers, calls } = createHandlers();

    await dispatchMigratorMode({
      mode: 'migrate',
      handlers,
    });

    expect(calls.check).not.toHaveBeenCalled();
    expect(calls.migrate).toHaveBeenCalledTimes(1);
    expect(calls.seed).not.toHaveBeenCalled();
    expect(calls.template).not.toHaveBeenCalled();
  });

  it('routes seed mode to seed handler only', async () => {
    const { handlers, calls } = createHandlers();

    await dispatchMigratorMode({
      mode: 'seed',
      handlers,
    });

    expect(calls.check).not.toHaveBeenCalled();
    expect(calls.migrate).not.toHaveBeenCalled();
    expect(calls.seed).toHaveBeenCalledTimes(1);
    expect(calls.template).not.toHaveBeenCalled();
  });

  it('routes template mode to template handler only', async () => {
    const { handlers, calls } = createHandlers();

    await dispatchMigratorMode({
      mode: 'template',
      handlers,
    });

    expect(calls.check).not.toHaveBeenCalled();
    expect(calls.migrate).not.toHaveBeenCalled();
    expect(calls.seed).not.toHaveBeenCalled();
    expect(calls.template).toHaveBeenCalledTimes(1);
  });

  it('dispatches using process.env.MIGRATOR_MODE in runFromEnvironment', async () => {
    const { handlers, calls } = createHandlers();
    setRequiredAppwriteEnv();
    process.env.MIGRATOR_MODE = '  TeMPlAte  ';

    await runFromEnvironment(handlers);

    expect(calls.template).toHaveBeenCalledTimes(1);
    expect(calls.check).not.toHaveBeenCalled();
    expect(calls.migrate).not.toHaveBeenCalled();
    expect(calls.seed).not.toHaveBeenCalled();
  });

  it('prioritizes CLI mode flag over MIGRATOR_MODE from env', async () => {
    const { handlers, calls } = createHandlers();
    setRequiredAppwriteEnv();
    process.env.MIGRATOR_MODE = 'template';

    await runFromEnvironment(handlers, ['--check']);

    expect(calls.check).toHaveBeenCalledTimes(1);
    expect(calls.template).not.toHaveBeenCalled();
    expect(calls.migrate).not.toHaveBeenCalled();
    expect(calls.seed).not.toHaveBeenCalled();
  });

  it('accepts --migrator-env-file without conflicting with mode flags', async () => {
    const { handlers, calls } = createHandlers();
    const runtimeEnv = createRuntimeEnvFile('template');

    try {
      await runFromEnvironment(handlers, [
        '--migrator-env-file',
        runtimeEnv.path,
        '--check',
      ]);
    } finally {
      runtimeEnv.cleanup();
    }

    expect(calls.check).toHaveBeenCalledTimes(1);
    expect(calls.template).not.toHaveBeenCalled();
    expect(calls.migrate).not.toHaveBeenCalled();
    expect(calls.seed).not.toHaveBeenCalled();
  });

  it('loads runtime env file from MIGRATOR_ENV_FILE when CLI flag is not provided', async () => {
    const { handlers, calls } = createHandlers();
    const runtimeEnv = createRuntimeEnvFile('template');
    delete process.env.MIGRATOR_MODE;
    delete process.env.APPWRITE_ENDPOINT;
    delete process.env.APPWRITE_PROJECT_ID;
    delete process.env.APPWRITE_API_KEY;
    delete process.env.APPWRITE_DATABASE_ID;
    delete process.env.APPWRITE_CURATOR_TEAM_ID;
    process.env.MIGRATOR_ENV_FILE = runtimeEnv.path;

    try {
      await runFromEnvironment(handlers);
    } finally {
      runtimeEnv.cleanup();
    }

    expect(calls.template).toHaveBeenCalledTimes(1);
    expect(calls.check).not.toHaveBeenCalled();
    expect(calls.migrate).not.toHaveBeenCalled();
    expect(calls.seed).not.toHaveBeenCalled();
  });

  it('fails fast when migrator mode is invalid in centralized config', async () => {
    const { handlers, calls } = createHandlers();
    setRequiredAppwriteEnv();
    process.env.MIGRATOR_MODE = 'invalid-mode';

    await expect(runFromEnvironment(handlers)).rejects.toThrow(
      '@repo/config invalid "migrator" env group',
    );

    expect(calls.check).not.toHaveBeenCalled();
    expect(calls.migrate).not.toHaveBeenCalled();
    expect(calls.seed).not.toHaveBeenCalled();
    expect(calls.template).not.toHaveBeenCalled();
  });

  it('fails fast when required appwrite env is missing', async () => {
    const { handlers, calls } = createHandlers();
    process.env.MIGRATOR_MODE = 'check';

    delete process.env.APPWRITE_ENDPOINT;
    delete process.env.APPWRITE_PROJECT_ID;
    delete process.env.APPWRITE_API_KEY;
    delete process.env.APPWRITE_DATABASE_ID;
    delete process.env.APPWRITE_CURATOR_TEAM_ID;

    await expect(runFromEnvironment(handlers)).rejects.toThrow(
      '@repo/config invalid "appwrite" env group',
    );

    expect(calls.check).not.toHaveBeenCalled();
    expect(calls.migrate).not.toHaveBeenCalled();
    expect(calls.seed).not.toHaveBeenCalled();
    expect(calls.template).not.toHaveBeenCalled();
  });

  it('fails fast when conflicting CLI mode flags are provided', async () => {
    const { handlers, calls } = createHandlers();
    setRequiredAppwriteEnv();
    process.env.MIGRATOR_MODE = 'check';

    await expect(
      runFromEnvironment(handlers, ['--migrate', '--check']),
    ).rejects.toBeInstanceOf(ConflictingMigratorCliFlagsError);

    expect(calls.check).not.toHaveBeenCalled();
    expect(calls.migrate).not.toHaveBeenCalled();
    expect(calls.seed).not.toHaveBeenCalled();
    expect(calls.template).not.toHaveBeenCalled();
  });

  it('resolves mode from CLI flags', () => {
    expect(resolveModeFromCliArgs(['--migrate'])).toBe('migrate');
    expect(resolveModeFromCliArgs(['foo', '--template'])).toBe('template');
    expect(resolveModeFromCliArgs([])).toBeUndefined();
  });

  it('throws when resolveModeFromCliArgs receives multiple mode flags', () => {
    expect(() => resolveModeFromCliArgs(['--check', '--seed'])).toThrow(
      ConflictingMigratorCliFlagsError,
    );
  });

  it('resolves template output path to cwd by default', () => {
    expect(resolveTemplateOutputPathFromCliArgs([], '/tmp/workspace')).toBe(
      '/tmp/workspace/seed-template.json',
    );
  });

  it('resolves template output path from --template-output flag', () => {
    expect(
      resolveTemplateOutputPathFromCliArgs(
        ['--template-output=./artifacts/template.json'],
        '/tmp/workspace',
      ),
    ).toBe('/tmp/workspace/artifacts/template.json');
  });

  it('throws when --template-output has no value', () => {
    expect(() =>
      resolveTemplateOutputPathFromCliArgs(
        ['--template-output'],
        '/tmp/workspace',
      ),
    ).toThrow(MissingTemplateOutputPathError);
  });

  it('derives markdown output path from default template output path', () => {
    expect(
      resolveTemplateMarkdownOutputPath(
        '/tmp/workspace/seed-template.json',
        '/tmp/workspace',
      ),
    ).toBe('/tmp/workspace/seed-template.md');
  });

  it('derives markdown output path from custom template output path', () => {
    expect(
      resolveTemplateMarkdownOutputPath(
        '/tmp/workspace/artifacts/template.json',
      ),
    ).toBe('/tmp/workspace/artifacts/template.md');
  });

  it('reports no pending changes when audit delta is empty', () => {
    expect(
      hasPendingStructuralChanges({
        missingTables: [],
        missingColumns: [],
      }),
    ).toBe(false);
  });

  it('reports pending changes when audit delta has missing tables or columns', () => {
    expect(
      hasPendingStructuralChanges({
        missingTables: [
          {
            id: 'demo',
            name: 'Demo',
            uniqueLogicKeys: { byName: ['name'] },
            columns: [
              { key: 'name', type: 'string', required: true, size: 64 },
            ],
            indexes: [],
          },
        ],
        missingColumns: [],
      }),
    ).toBe(true);

    expect(
      hasPendingStructuralChanges({
        missingTables: [],
        missingColumns: [
          {
            tableId: 'demo',
            tableName: 'Demo',
            columns: [
              { key: 'title', type: 'string', required: true, size: 64 },
            ],
          },
        ],
      }),
    ).toBe(true);
  });

  it('runAuditCheck throws when structural delta has pending changes', async () => {
    const pendingDelta: MigrationStructuralDelta = {
      missingTables: [],
      missingColumns: [
        {
          tableId: 'demo',
          tableName: 'Demo',
          columns: [{ key: 'title', type: 'string', required: true, size: 64 }],
        },
      ],
    };

    await expect(
      runAuditCheck({
        calculateStructuralDelta: vi.fn(async () => pendingDelta),
      }),
    ).rejects.toBeInstanceOf(PendingStructuralChangesError);
  });

  it('runAuditCheck resolves when structural delta is synced', async () => {
    const syncedDelta: MigrationStructuralDelta = {
      missingTables: [],
      missingColumns: [],
    };

    await expect(
      runAuditCheck({
        calculateStructuralDelta: vi.fn(async () => syncedDelta),
      }),
    ).resolves.toBeUndefined();
  });

  it('runs seed mode from template-shaped payload and applies create/update actions', async () => {
    const storageService = {
      resolveFileIdByName: vi.fn(async () => 'seed-file-id'),
      download: vi.fn(async () =>
        Buffer.from(
          JSON.stringify({
            version: 1,
            tables: {
              about: {
                rows: [
                  {
                    name: 'Tiago',
                    title: 'Engineer',
                    bio: 'Updated bio',
                    locale: 'en',
                  },
                  {
                    name: 'Tiago',
                    title: 'Engenheiro',
                    bio: 'Construindo sistemas limpos',
                    locale: 'pt',
                  },
                ],
              },
            },
          }),
          'utf8',
        ),
      ),
    };

    const tablesClient = {
      listRows: vi.fn(
        async (input: { databaseId: string; tableId: string }) => {
          if (input.tableId === 'about') {
            return {
              total: 1,
              rows: [
                {
                  $id: 'about-1',
                  name: 'Tiago',
                  title: 'Engineer',
                  bio: 'Old bio',
                  locale: 'en',
                },
              ],
            };
          }

          return {
            total: 0,
            rows: [],
          };
        },
      ),
      createRow: vi.fn(async () => ({})),
      updateRow: vi.fn(async () => ({})),
    };

    await expect(
      runSeedMode({
        databaseId: 'database-id',
        seedBucketId: 'seed-bucket',
        seedFileName: 'seed-data.json',
        storageService,
        tablesClient: tablesClient as unknown as Pick<
          TablesDB,
          'listRows' | 'createRow' | 'updateRow'
        >,
      }),
    ).resolves.toBeUndefined();

    expect(storageService.resolveFileIdByName).toHaveBeenCalledWith({
      bucketId: 'seed-bucket',
      fileName: 'seed-data.json',
    });

    expect(storageService.download).toHaveBeenCalledWith({
      bucketId: 'seed-bucket',
      fileId: 'seed-file-id',
    });

    expect(tablesClient.updateRow).toHaveBeenCalledTimes(1);
    expect(tablesClient.updateRow).toHaveBeenCalledWith(
      expect.objectContaining({
        databaseId: 'database-id',
        tableId: 'about',
        rowId: 'about-1',
      }),
    );

    expect(tablesClient.createRow).toHaveBeenCalledTimes(1);
    expect(tablesClient.createRow).toHaveBeenCalledWith(
      expect.objectContaining({
        databaseId: 'database-id',
        tableId: 'about',
      }),
    );
  });

  it('writes template JSON to the provided output file path', async () => {
    const folder = mkdtempSync(join(tmpdir(), 'template-output-'));
    const outputPath = join(folder, 'nested', 'template.json');
    const markdownOutputPath = join(folder, 'nested', 'template.md');

    try {
      await runTemplateMode({ outputFilePath: outputPath });

      const writtenJson = readFileSync(outputPath, 'utf8');
      const writtenMarkdown = readFileSync(markdownOutputPath, 'utf8');

      expect(writtenJson).toContain('"version": 1');
      expect(writtenJson).toContain('"tables"');
      expect(writtenMarkdown).toContain('# Seed Template Specification');
    } finally {
      rmSync(folder, { recursive: true, force: true });
    }
  });
});
