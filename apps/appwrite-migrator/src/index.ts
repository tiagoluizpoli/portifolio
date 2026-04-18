import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DocumentMapper,
  getTablesClient,
  ID,
  initializeAppwrite,
  MigrationService,
  type MigrationStructuralDelta,
  Query,
  StorageService,
  type TablesDB,
} from '@repo/appwrite';
import { type EnvLoadOptions, getEnv } from '@repo/config';
import {
  type ExistingSeedRow,
  type ExistingSeedState,
  SeederService,
  type SeedTableId,
} from './services/seeder.js';

export type MigratorMode = 'check' | 'migrate' | 'seed' | 'template';
export type MigratorCliFlag = `--${MigratorMode}`;

const envFileCliFlags = ['--env-file', '--migrator-env-file'] as const;
const templateOutputCliFlag = '--template-output';
const defaultTemplateFileName = 'seed-template.json';
const defaultTemplateMarkdownFileName = 'seed-template.md';

export interface MigratorModeHandlers {
  check: () => Promise<void>;
  migrate: () => Promise<void>;
  seed: () => Promise<void>;
  template: () => Promise<void>;
}

export class PendingStructuralChangesError extends Error {
  readonly delta: MigrationStructuralDelta;

  constructor(delta: MigrationStructuralDelta) {
    super('Audit check failed: pending structural changes detected.');
    this.name = 'PendingStructuralChangesError';
    this.delta = delta;
  }
}

export class ConflictingMigratorCliFlagsError extends Error {
  readonly flags: MigratorCliFlag[];

  constructor(flags: MigratorCliFlag[]) {
    super(
      `Conflicting migrator mode flags provided: ${flags.join(', ')}. Use only one of: --check, --migrate, --seed, --template.`,
    );
    this.name = 'ConflictingMigratorCliFlagsError';
    this.flags = flags;
  }
}

export class MissingTemplateOutputPathError extends Error {
  constructor() {
    super(
      `Missing value for ${templateOutputCliFlag}. Provide a path, for example: ${templateOutputCliFlag}=./seed-template.json`,
    );
    this.name = 'MissingTemplateOutputPathError';
  }
}

const modeByFlag: Record<MigratorCliFlag, MigratorMode> = {
  '--check': 'check',
  '--migrate': 'migrate',
  '--seed': 'seed',
  '--template': 'template',
};

function isMigratorCliFlag(value: string): value is MigratorCliFlag {
  return value in modeByFlag;
}

interface RuntimeEnvironment {
  appwrite: {
    endpoint: string;
    projectId: string;
    apiKey: string;
    databaseId: string;
  };
  migrator: {
    mode: MigratorMode;
    seedBucketId?: string;
    seedFileName?: string;
  };
}

const seedTableIds: SeedTableId[] = [
  'about',
  'home',
  'contact_info',
  'socials',
  'platforms',
  'solutions',
  'skills',
  'educations',
  'experiences',
  'impact_metrics',
  'metric_sources',
];

const seedPageSize = 100;

interface SeedTablesClient
  extends Pick<TablesDB, 'listRows' | 'createRow' | 'updateRow'> {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeSeedPayloadShape(input: unknown): unknown {
  if (!isRecord(input)) {
    return input;
  }

  const templateTables = input.tables;

  if (!isRecord(templateTables)) {
    return input;
  }

  let hasTemplateRows = false;
  const normalized: Partial<Record<SeedTableId, unknown[]>> = {};

  for (const tableId of seedTableIds) {
    const tableEntry = templateTables[tableId];

    if (!isRecord(tableEntry)) {
      continue;
    }

    if (!Array.isArray(tableEntry.rows)) {
      continue;
    }

    normalized[tableId] = tableEntry.rows;
    hasTemplateRows = true;
  }

  return hasTemplateRows ? normalized : input;
}

async function listAllRowsByTable(input: {
  tablesClient: SeedTablesClient;
  databaseId: string;
  tableId: SeedTableId;
}): Promise<ExistingSeedRow[]> {
  const rows: ExistingSeedRow[] = [];
  let offset = 0;

  while (true) {
    const response = await input.tablesClient.listRows({
      databaseId: input.databaseId,
      tableId: input.tableId,
      queries: [Query.limit(seedPageSize), Query.offset(offset)],
    });

    for (const rawRow of response.rows) {
      const asRecord = rawRow as Record<string, unknown>;
      const domain = DocumentMapper.toDomain<Record<string, unknown>>(asRecord);
      const mappedId =
        typeof domain.id === 'string'
          ? domain.id
          : typeof asRecord.$id === 'string'
            ? asRecord.$id
            : '';

      rows.push({
        id: mappedId,
        ...domain,
      });
    }

    if (response.rows.length < seedPageSize) {
      break;
    }

    offset += response.rows.length;
  }

  return rows;
}

async function buildExistingSeedState(input: {
  tablesClient: SeedTablesClient;
  databaseId: string;
}): Promise<ExistingSeedState> {
  const stateEntries = await Promise.all(
    seedTableIds.map(async (tableId) => {
      const rows = await listAllRowsByTable({
        tablesClient: input.tablesClient,
        databaseId: input.databaseId,
        tableId,
      });

      return [tableId, rows] as const;
    }),
  );

  return Object.fromEntries(stateEntries) as ExistingSeedState;
}

async function readSeedPayloadFromStorage(input: {
  storageService: Pick<StorageService, 'download' | 'resolveFileIdByName'>;
  bucketId: string;
  fileName: string;
}): Promise<unknown> {
  const fileId = await input.storageService.resolveFileIdByName({
    bucketId: input.bucketId,
    fileName: input.fileName,
  });

  const payloadBuffer = await input.storageService.download({
    bucketId: input.bucketId,
    fileId,
  });

  try {
    return normalizeSeedPayloadShape(
      JSON.parse(payloadBuffer.toString('utf8')),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'unknown parse error';
    throw new Error(
      `Failed to parse seed payload from storage file "${input.fileName}": ${message}`,
    );
  }
}

export async function runSeedMode(input: {
  databaseId: string;
  seedBucketId: string;
  seedFileName: string;
  seederService?: SeederService;
  storageService?: Pick<StorageService, 'download' | 'resolveFileIdByName'>;
  tablesClient?: SeedTablesClient;
}): Promise<void> {
  const seederService = input.seederService ?? new SeederService();
  const storageService = input.storageService ?? new StorageService();
  const tablesClient = input.tablesClient ?? getTablesClient();

  const payload = await readSeedPayloadFromStorage({
    storageService,
    bucketId: input.seedBucketId,
    fileName: input.seedFileName,
  });

  const validatedRows = seederService.validateRows(payload);
  const existingRows = await buildExistingSeedState({
    tablesClient,
    databaseId: input.databaseId,
  });

  const plan = seederService.buildUpsertPlan({
    validatedRows,
    existingRows,
  });

  const stats = await seederService.executeUpsertPlan({
    plan,
    executeOperation: async (operation) => {
      if (operation.action === 'create') {
        await tablesClient.createRow({
          databaseId: input.databaseId,
          tableId: operation.tableId,
          rowId: ID.unique(),
          data: DocumentMapper.toAppwrite(operation.data),
        });
        return;
      }

      if (operation.action === 'update') {
        if (!operation.rowId) {
          throw new Error(
            `Missing rowId for update operation at ${operation.tableId}#${operation.rowIndex}`,
          );
        }

        await tablesClient.updateRow({
          databaseId: input.databaseId,
          tableId: operation.tableId,
          rowId: operation.rowId,
          data: DocumentMapper.toAppwrite(operation.data),
        });
      }
    },
  });

  console.info(
    `[seed] operations=${plan.operations.length} created=${stats.created} updated=${stats.updated} ignored=${stats.ignored} retries=${stats.retries}`,
  );
}

export function resolveTemplateOutputPathFromCliArgs(
  args: readonly string[],
  cwd: string = process.cwd(),
): string {
  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];

    if (current === templateOutputCliFlag) {
      const next = args[index + 1];

      if (!next || next.startsWith('--')) {
        throw new MissingTemplateOutputPathError();
      }

      return resolve(cwd, next);
    }

    if (current.startsWith(`${templateOutputCliFlag}=`)) {
      const outputPath = current.slice(`${templateOutputCliFlag}=`.length);

      if (outputPath.trim().length === 0) {
        throw new MissingTemplateOutputPathError();
      }

      return resolve(cwd, outputPath);
    }
  }

  return resolve(cwd, defaultTemplateFileName);
}

export function resolveTemplateMarkdownOutputPath(
  templateOutputFilePath: string,
  cwd: string = process.cwd(),
): string {
  const defaultJsonPath = resolve(cwd, defaultTemplateFileName);

  if (templateOutputFilePath === defaultJsonPath) {
    return resolve(cwd, defaultTemplateMarkdownFileName);
  }

  const extension = extname(templateOutputFilePath);

  if (extension.length === 0) {
    return `${templateOutputFilePath}.md`;
  }

  return `${templateOutputFilePath.slice(0, -extension.length)}.md`;
}

export async function runTemplateMode(input?: {
  seederService?: SeederService;
  outputFilePath?: string;
}): Promise<void> {
  const seederService = input?.seederService ?? new SeederService();
  const outputFilePath =
    input?.outputFilePath ?? resolve(process.cwd(), defaultTemplateFileName);
  const markdownOutputFilePath =
    resolveTemplateMarkdownOutputPath(outputFilePath);

  const artifacts = seederService.generateTemplateArtifacts();
  await mkdir(dirname(outputFilePath), { recursive: true });
  await mkdir(dirname(markdownOutputFilePath), { recursive: true });
  await writeFile(outputFilePath, artifacts.templateJson, 'utf8');
  await writeFile(markdownOutputFilePath, artifacts.markdownSpec, 'utf8');

  console.info(
    `[template] json=${outputFilePath} markdown=${markdownOutputFilePath}`,
  );
}

function resolveEnvFilePathFromCliArgs(
  args: readonly string[],
): string | undefined {
  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];

    if (envFileCliFlags.some((flag) => current === flag)) {
      return args[index + 1];
    }

    for (const flag of envFileCliFlags) {
      if (current.startsWith(`${flag}=`)) {
        return current.slice(`${flag}=`.length);
      }
    }
  }

  return undefined;
}

function stripEnvFileCliArgs(args: readonly string[]): string[] {
  const output: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];

    if (envFileCliFlags.some((flag) => current === flag)) {
      index += 1;
      continue;
    }

    if (envFileCliFlags.some((flag) => current.startsWith(`${flag}=`))) {
      continue;
    }

    output.push(current);
  }

  return output;
}

function createDefaultHandlers(input: {
  databaseId: string;
  seedBucketId?: string;
  seedFileName?: string;
  templateOutputFilePath?: string;
}): MigratorModeHandlers {
  const migrationService = new MigrationService({
    databaseId: input.databaseId,
  });
  const seederService = new SeederService();

  return {
    check: async () => {
      await runAuditCheck(migrationService);
    },
    migrate: async () => {
      await migrationService.migrate();
    },
    seed: async () => {
      if (!input.seedBucketId || !input.seedFileName) {
        throw new Error(
          'Missing seed source configuration. Provide SEED_BUCKET_ID and SEED_FILE_NAME.',
        );
      }

      await runSeedMode({
        databaseId: input.databaseId,
        seedBucketId: input.seedBucketId,
        seedFileName: input.seedFileName,
      });
    },
    template: async () => {
      await runTemplateMode({
        seederService,
        outputFilePath: input.templateOutputFilePath,
      });
    },
  };
}

export function hasPendingStructuralChanges(
  delta: MigrationStructuralDelta,
): boolean {
  return delta.missingTables.length > 0 || delta.missingColumns.length > 0;
}

export async function runAuditCheck(
  migrationService: Pick<MigrationService, 'calculateStructuralDelta'>,
): Promise<void> {
  const delta = await migrationService.calculateStructuralDelta();

  if (hasPendingStructuralChanges(delta)) {
    throw new PendingStructuralChangesError(delta);
  }
}

export function initializeRuntimeFromEnvironment(
  options?: EnvLoadOptions,
): void {
  const env = getEnv({ appwrite: true }, options).appwrite;

  initializeAppwrite({
    endpoint: env.endpoint,
    projectId: env.projectId,
    apiKey: env.apiKey,
  });
}

function resolveRuntimeEnvironment(
  options?: EnvLoadOptions,
): RuntimeEnvironment {
  const env = getEnv({ appwrite: true, migrator: true }, options);

  return {
    appwrite: {
      endpoint: env.appwrite.endpoint,
      projectId: env.appwrite.projectId,
      apiKey: env.appwrite.apiKey,
      databaseId: env.appwrite.databaseId,
    },
    migrator: {
      mode: env.migrator.mode,
      seedBucketId: env.migrator.seedBucketId,
      seedFileName: env.migrator.seedFileName,
    },
  };
}

export async function dispatchMigratorMode(input: {
  mode: MigratorMode;
  handlers: MigratorModeHandlers;
}): Promise<void> {
  const handlersByMode: Record<MigratorMode, () => Promise<void>> = {
    check: input.handlers.check,
    migrate: input.handlers.migrate,
    seed: input.handlers.seed,
    template: input.handlers.template,
  };

  await handlersByMode[input.mode]();
}

export function resolveModeFromCliArgs(
  args: readonly string[],
): MigratorMode | undefined {
  const flags = [...new Set(args.filter(isMigratorCliFlag))];

  if (flags.length === 0) {
    return undefined;
  }

  if (flags.length > 1) {
    throw new ConflictingMigratorCliFlagsError(flags);
  }

  return modeByFlag[flags[0]];
}

export async function runFromEnvironment(
  handlers?: MigratorModeHandlers,
  cliArgs: readonly string[] = process.argv.slice(2),
): Promise<void> {
  const templateOutputFilePath = resolveTemplateOutputPathFromCliArgs(cliArgs);
  const envFilePath =
    resolveEnvFilePathFromCliArgs(cliArgs) ?? process.env.MIGRATOR_ENV_FILE;
  const modeArgs = stripEnvFileCliArgs(cliArgs);
  const env = resolveRuntimeEnvironment(
    envFilePath ? { envFilePath } : undefined,
  );
  const mode = resolveModeFromCliArgs(modeArgs) ?? env.migrator.mode;

  initializeAppwrite({
    endpoint: env.appwrite.endpoint,
    projectId: env.appwrite.projectId,
    apiKey: env.appwrite.apiKey,
  });

  await dispatchMigratorMode({
    mode,
    handlers:
      handlers ??
      createDefaultHandlers({
        databaseId: env.appwrite.databaseId,
        seedBucketId: env.migrator.seedBucketId,
        seedFileName: env.migrator.seedFileName,
        templateOutputFilePath,
      }),
  });
}

function isDirectExecution(): boolean {
  if (!process.argv[1]) {
    return false;
  }

  const moduleMeta = import.meta as ImportMeta & { url: string };
  return fileURLToPath(moduleMeta.url) === process.argv[1];
}

if (isDirectExecution()) {
  runFromEnvironment().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
