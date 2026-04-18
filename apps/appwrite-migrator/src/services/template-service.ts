import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { BaseService } from '@/core/base-service';
import type { MigratorContext } from '@/core/types';
import { SeederService as InternalSeeder } from '@/services/seeder';

export class TemplateService extends BaseService {
  async execute(context: MigratorContext): Promise<void> {
    const outputFilePath = resolve(
      process.cwd(),
      context.output || 'seed-template.json',
    );
    const markdownOutputFilePath =
      this.resolveTemplateMarkdownOutputPath(outputFilePath);

    this.log(
      'template',
      `Generating templates: ${outputFilePath}, ${markdownOutputFilePath}`,
    );

    const internalSeeder = new InternalSeeder();
    const artifacts = internalSeeder.generateTemplateArtifacts();

    await mkdir(dirname(outputFilePath), { recursive: true });
    await mkdir(dirname(markdownOutputFilePath), { recursive: true });

    await writeFile(outputFilePath, artifacts.templateJson, 'utf8');
    await writeFile(markdownOutputFilePath, artifacts.markdownSpec, 'utf8');

    this.log('template', 'Template generation complete.');
  }

  private resolveTemplateMarkdownOutputPath(
    templateOutputFilePath: string,
  ): string {
    const extension = templateOutputFilePath.split('.').pop();
    if (!extension || extension === templateOutputFilePath) {
      return `${templateOutputFilePath}.md`;
    }
    return templateOutputFilePath.replace(/\.[^/.]+$/, '.md');
  }
}
