import type { AppwriteGroup, MigratorGroup } from '@repo/config';

export type MigratorMode = 'check' | 'migrate' | 'seed' | 'template';

export interface MigratorContext {
  mode: MigratorMode;
  env?: string;
  payload?: string;
  output?: string;
  force?: boolean;
  config: {
    appwrite: AppwriteGroup;
    migrator: MigratorGroup;
  };
}

export interface IMigratorService {
  execute(context: MigratorContext): Promise<void>;
}
