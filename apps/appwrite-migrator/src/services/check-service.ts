import { MigrationService } from '@repo/appwrite';
import { BaseService } from '@/core/base-service';
import { PendingStructuralChangesError } from '@/core/errors';
import type { MigratorContext } from '@/core/types';

export class CheckService extends BaseService {
  async execute(context: MigratorContext): Promise<void> {
    this.log('check', 'Running structural audit check...');

    const migrationService = new MigrationService({
      databaseId: context.config.appwrite.databaseId,
    });

    const delta = await migrationService.calculateStructuralDelta();

    if (delta.missingTables.length > 0 || delta.missingColumns.length > 0) {
      throw new PendingStructuralChangesError(delta);
    }

    this.log('check', 'Structural audit check passed. System is in sync.');
  }
}
