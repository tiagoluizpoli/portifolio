#!/usr/bin/env node

import { MigratorCli } from '@/cli/migrator-cli';
import { PendingStructuralChangesError } from '@/core/errors';

function printPendingChanges(error: PendingStructuralChangesError): void {
  const { missingTables, missingColumns } = error.delta;

  if (missingTables.length > 0) {
    const tableList = missingTables.map((table) => table.id).join(', ');
    console.error(`[check] Missing tables: ${tableList}`);
  }

  if (missingColumns.length > 0) {
    console.error('[check] Missing columns:');
    for (const table of missingColumns) {
      const columns = table.columns.map((column) => column.key).join(', ');
      console.error(`[check] - ${table.tableId}: ${columns}`);
    }
  }
}

async function bootstrap() {
  const cli = new MigratorCli();

  try {
    await cli.run();
  } catch (error) {
    if (error instanceof PendingStructuralChangesError) {
      console.error(`[error] ${error.message}`);
      printPendingChanges(error);
      process.exit(1);
    }

    if (error instanceof Error) {
      console.error(`[error] ${error.message}`);
    } else {
      console.error('[error] An unknown error occurred');
    }
    process.exit(1);
  }
}

bootstrap();
