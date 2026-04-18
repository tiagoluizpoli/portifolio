import type { IMigratorService, MigratorContext } from '@/core/types';

export abstract class BaseService implements IMigratorService {
  protected log(mode: string, message: string): void {
    console.log(`[${mode}] ${message}`);
  }

  abstract execute(context: MigratorContext): Promise<void>;
}
