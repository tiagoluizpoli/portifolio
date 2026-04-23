import { Command, InvalidArgumentError } from 'commander';
import { z } from 'zod';

const modeKeys = ['check', 'migrate', 'seed', 'template'] as const;
type CliMode = (typeof modeKeys)[number];

export interface CliConfig {
  mode: CliMode;
  env?: string;
  payload?: string;
  output?: string;
  force: boolean;
}

const nonEmptyString = z.string().trim().min(1, 'Flag values cannot be empty.');

const rawCliConfigSchema = z
  .object({
    check: z.boolean().default(false),
    migrate: z.boolean().default(false),
    seed: z.boolean().default(false),
    template: z.boolean().default(false),
    env: nonEmptyString.optional(),
    payload: nonEmptyString.optional(),
    output: nonEmptyString.optional(),
    force: z.boolean().default(false),
  })
  .strict();

export const cliConfigSchema = rawCliConfigSchema
  .superRefine((raw, context) => {
    const activeModes = modeKeys.filter((key) => raw[key]);

    if (activeModes.length > 1) {
      context.addIssue({
        code: 'custom',
        message: `Only one mode can be active. Found: ${activeModes.join(', ')}`,
      });
    }

    if (activeModes.length === 0) {
      context.addIssue({
        code: 'custom',
        message:
          'Mode flag is required: --check, --migrate, --seed, or --template',
      });
    }
  })
  .transform((raw): CliConfig => {
    const mode = modeKeys.find((key) => raw[key]);

    if (!mode) {
      throw new InvalidArgumentError(
        'Mode flag is required: --check, --migrate, --seed, or --template',
      );
    }

    return {
      mode,
      env: raw.env,
      payload: raw.payload,
      output: raw.output,
      force: raw.force,
    };
  });

function buildProgram(): Command {
  return new Command()
    .name('migrator')
    .allowUnknownOption(false)
    .allowExcessArguments(false)
    .configureOutput({
      writeErr: () => {},
    })
    .exitOverride()
    .option('--check', 'Run structural check mode')
    .option('--migrate', 'Run migrate mode')
    .option('--seed', 'Run seed mode')
    .option('--template', 'Run template mode')
    .option('--env <envFile>', 'Path to env file')
    .option('--payload <file>', 'Input payload file')
    .option('--output <file>', 'Output file path')
    .option('--force', 'Force operation execution');
}

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error('Failed to parse CLI arguments.');
}

function normalizeArgv(argv: string[]): string[] {
  if (argv.length > 0 && argv[0] === '--') {
    return argv.slice(1);
  }

  return argv;
}

export function parseCliConfig(argv: string[]): CliConfig {
  const program = buildProgram();
  const normalizedArgv = normalizeArgv(argv);

  let options: unknown;
  try {
    program.parse(normalizedArgv, { from: 'user' });
    options = program.opts();
  } catch (error: unknown) {
    throw normalizeError(error);
  }

  const parsed = cliConfigSchema.safeParse(options);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues
        .map((issue: { message: string }) => issue.message)
        .join('; '),
    );
  }

  return parsed.data;
}
