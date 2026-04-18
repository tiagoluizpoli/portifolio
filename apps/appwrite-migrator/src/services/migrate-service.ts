import { MigrationService } from '@repo/appwrite';
import { BaseService } from '@/core/base-service';
import type { MigratorContext } from '@/core/types';

export class MigrateService extends BaseService {
  async execute(context: MigratorContext): Promise<void> {
    this.log('migrate', 'Starting database migration...');

    const migrationService = new MigrationService({
      databaseId: context.config.appwrite.databaseId,
    });

    const result = await migrationService.migrate();

    this.log(
      'migrate',
      `Migration complete. Created: ${result.createdTables.length} tables, ${result.createdColumns.length} columns, ${result.createdIndexes.length} indexes.`,
    );
  }
}
