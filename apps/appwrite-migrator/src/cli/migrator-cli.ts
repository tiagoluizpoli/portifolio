import { initializeAppwrite } from '@repo/appwrite';
import { type AppwriteGroup, getEnv, type MigratorGroup } from '@repo/config';
import type { MigratorContext, MigratorMode } from '@/core/types';
import { CheckService } from '@/services/check-service';
import { MigrateService } from '@/services/migrate-service';
import { SeedService } from '@/services/seed-service';
import { TemplateService } from '@/services/template-service';

export class MigratorCli {
  async run(argv: string[] = process.argv.slice(2)): Promise<void> {
    const flags = this.parseFlags(argv);
    const envFilePath = flags.get('--env');

    const env = getEnv(
      { appwrite: true, migrator: true },
      envFilePath ? { envFilePath } : undefined,
    );

    initializeAppwrite({
      endpoint: env.appwrite.endpoint,
      projectId: env.appwrite.projectId,
      apiKey: env.appwrite.apiKey,
    });

    const context = this.buildContextWithConfig(flags, env);

    const service = this.getServicePattern(context.mode);
    await service.execute(context);
  }

  private getServicePattern(mode: MigratorMode) {
    if (mode === 'check') return new CheckService();
    if (mode === 'migrate') return new MigrateService();
    if (mode === 'seed') return new SeedService();
    if (mode === 'template') return new TemplateService();
    throw new Error(`Unsupported service mode: ${mode}`);
  }

  private buildContextWithConfig(
    flags: Map<string, string | undefined>,
    config: { appwrite: AppwriteGroup; migrator: MigratorGroup },
  ): MigratorContext {
    const modeFlags: MigratorMode[] = ['check', 'migrate', 'seed', 'template'];
    const activeModes = modeFlags.filter((mode) => flags.has(`--${mode}`));

    if (activeModes.length > 1) {
      throw new Error(
        `Only one mode can be active. Found: ${activeModes.join(', ')}`,
      );
    }

    if (activeModes.length === 0) {
      throw new Error(
        'Mode flag is required: --check, --migrate, --seed, or --template',
      );
    }

    const mode = activeModes[0];

    return {
      mode,
      env: flags.get('--env'),
      payload: flags.get('--payload'),
      output: flags.get('--output'),
      force: flags.has('--force'),
      config,
    };
  }

  private parseFlags(argv: string[]): Map<string, string | undefined> {
    const flags = new Map<string, string | undefined>();
    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];
      if (arg.startsWith('--')) {
        const nextArg = argv[i + 1];
        if (nextArg && !nextArg.startsWith('--')) {
          flags.set(arg, nextArg);
          i++;
        } else {
          flags.set(arg, undefined);
        }
      }
    }
    return flags;
  }
}
