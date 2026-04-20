import { initializeAppwrite } from '@repo/appwrite';
import { type AppwriteGroup, getEnv, type MigratorGroup } from '@repo/config';
import { type CliConfig, parseCliConfig } from '@/cli/cli-config';
import type { MigratorContext, MigratorMode } from '@/core/types';
import { CheckService } from '@/services/check-service';
import { MigrateService } from '@/services/migrate-service';
import { SeedService } from '@/services/seed-service';
import { TemplateService } from '@/services/template-service';

export class MigratorCli {
  async run(argv: string[] = process.argv.slice(2)): Promise<void> {
    const cliConfig = parseCliConfig(argv);
    const envFilePath = cliConfig.env;

    const env = getEnv(
      { appwrite: true, migrator: true },
      envFilePath ? { envFilePath } : undefined,
    );

    initializeAppwrite({
      endpoint: env.appwrite.endpoint,
      projectId: env.appwrite.projectId,
      apiKey: env.appwrite.apiKey,
    });

    const context = this.buildContextWithConfig(cliConfig, env);

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

  protected buildContextWithConfig(
    cliConfig: CliConfig,
    config: { appwrite: AppwriteGroup; migrator: MigratorGroup },
  ): MigratorContext {
    const mode: MigratorMode = cliConfig.mode;

    return {
      mode,
      env: cliConfig.env,
      payload: cliConfig.payload,
      output: cliConfig.output,
      force: cliConfig.force,
      config,
    };
  }
}
