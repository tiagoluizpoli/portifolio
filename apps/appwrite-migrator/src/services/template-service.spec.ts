import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_CONFIG } from '../tests/helpers/config.mock';
import { TemplateService } from '@/services/template-service';

describe('TemplateService', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'template-test-'));
    vi.clearAllMocks();
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('generates JSON and Markdown template files', async () => {
    const outputPath = join(testDir, 'my-template.json');
    const service = new TemplateService();

    await service.execute({
      mode: 'template',
      output: outputPath,
      config: MOCK_CONFIG,
    });

    expect(existsSync(outputPath)).toBe(true);
    expect(existsSync(outputPath.replace('.json', '.md'))).toBe(true);

    const content = readFileSync(outputPath, 'utf8');
    expect(content).toContain('"version": 1');
  });
});
