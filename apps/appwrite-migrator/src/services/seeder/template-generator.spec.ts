import { describe, expect, it } from 'vitest';
import { TemplateGenerator } from './template-generator';

describe('TemplateGenerator', () => {
  it('generates direct JSON template based on blueprints', () => {
    const generator = new TemplateGenerator();

    const result = generator.generateTemplateArtifacts({
      generatedAt: '2026-04-17T00:00:00.000Z',
    });

    expect(result.template.version).toBe(1);
    expect(result.template.tables.about).toHaveLength(1);
    expect(result.template.tables.contact_info[0]?.email).toContain('@');
    expect(result.template.tables.skills[0]?.title).toBeTypeOf('string');
  });

  it('generates markdown specification with all table sections', () => {
    const generator = new TemplateGenerator();

    const result = generator.generateTemplateArtifacts({
      generatedAt: '2026-04-17T00:00:00.000Z',
    });

    expect(result.markdownSpec).toContain('# Seed Template Specification');
    expect(result.markdownSpec).toContain('## Table `about`');
    expect(result.markdownSpec).toContain('## Table `contact_info`');
    expect(result.markdownSpec).toContain('Unique Logic Keys');
    expect(result.markdownSpec).toContain('| name | string | required |');
  });

  it('keeps generated artifacts deterministic with explicit timestamp', () => {
    const generator = new TemplateGenerator();

    const result = generator.generateTemplateArtifacts({
      generatedAt: '2026-04-17T00:00:00.000Z',
    });

    expect(result.template.generatedAt).toBe('2026-04-17T00:00:00.000Z');
    expect(result.templateJson).toContain(
      '"generatedAt": "2026-04-17T00:00:00.000Z"',
    );
  });
});
