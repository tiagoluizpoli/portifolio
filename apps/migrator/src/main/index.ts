import dotenv from 'dotenv';
import { MigratePortfolioUseCase } from '../application/migrate-portfolio.use-case.js';
import { SchemaManager } from '../infrastructure/schema.manager.js';
import { bootstrapAppwriteRuntime } from './bootstrap-appwrite.js';

dotenv.config();

async function main() {
  try {
    console.log('🚀 Starting Portfolio Migration...');

    // Parse CLI Flags for Conflict Resolution
    const conflictFlag = process.argv.find((arg) =>
      ['--overwrite', '--keep-newer', '--skip'].includes(arg),
    );

    let conflictStrategy: 'overwrite' | 'keep-newer' | 'skip';
    switch (conflictFlag) {
      case '--overwrite':
        conflictStrategy = 'overwrite';
        break;
      case '--keep-newer':
        conflictStrategy = 'keep-newer';
        break;
      case '--skip':
        conflictStrategy = 'skip';
        break;
      default:
        conflictStrategy = 'skip'; // Default per spec
        break;
    }

    console.log(`[INIT] Conflict Strategy: ${conflictStrategy}`);

    // Initialize Appwrite runtime
    bootstrapAppwriteRuntime();

    // 1. infrastructure Setup (Schema & Storage)
    const schemaManager = new SchemaManager();
    await schemaManager.run();

    // 2. Data Migration
    const migrateUseCase = new MigratePortfolioUseCase();
    await migrateUseCase.execute({ conflictStrategy });

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
