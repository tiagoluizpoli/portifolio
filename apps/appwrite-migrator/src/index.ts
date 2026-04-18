#!/usr/bin/env node
import { MigratorCli } from '@/cli/migrator-cli';

/**
 * Entry point for the Appwrite Migrator CLI.
 * Delegates all logic to the MigratorCli orchestrator.
 */
async function bootstrap() {
  const cli = new MigratorCli();

  try {
    await cli.run();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[error] ${error.message}`);
    } else {
      console.error('[error] An unknown error occurred');
    }
    process.exit(1);
  }
}

bootstrap();
