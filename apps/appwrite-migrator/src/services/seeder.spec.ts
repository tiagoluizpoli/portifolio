import { asTableId } from '@repo/appwrite-core';
import { describe, expect, it } from 'vitest';
import {
  SeedDeduplicationError,
  SeederService,
  SeedRateLimitError,
  type SeedTableId,
  SeedValidationError,
} from './seeder.js';

describe('SeederService', () => {
  it('generates layered JSON template based on blueprints', () => {
    const service = new SeederService();

    const result = service.generateTemplateArtifacts({
      generatedAt: '2026-04-17T00:00:00.000Z',
    });

    expect(result.template.version).toBe(1);
    expect(result.template.tables.about.rows).toHaveLength(1);
    expect(result.template.tables.about.uniqueLogicKeys.byLocale).toEqual([
      'locale',
    ]);
    expect(result.template.tables.contact_info.rows[0]?.email).toContain('@');
    expect(result.template.tables.skills.rows[0]?.title).toBeTypeOf('string');
  });

  it('generates markdown specification with all table sections', () => {
    const service = new SeederService();

    const result = service.generateTemplateArtifacts({
      generatedAt: '2026-04-17T00:00:00.000Z',
    });

    expect(result.markdownSpec).toContain('# Seed Template Specification');
    expect(result.markdownSpec).toContain('## Table `about`');
    expect(result.markdownSpec).toContain('## Table `contact_info`');
    expect(result.markdownSpec).toContain('Unique Logic Keys');
    expect(result.markdownSpec).toContain('| name | string | required |');
  });

  it('keeps generated artifacts deterministic with explicit timestamp', () => {
    const service = new SeederService();

    const result = service.generateTemplateArtifacts({
      generatedAt: '2026-04-17T00:00:00.000Z',
    });

    expect(result.template.generatedAt).toBe('2026-04-17T00:00:00.000Z');
    expect(result.templateJson).toContain(
      '"generatedAt": "2026-04-17T00:00:00.000Z"',
    );
  });

  it('plans create when no uniqueLogicKeys match exists remotely', () => {
    const service = new SeederService();

    const plan = service.buildUpsertPlan({
      validatedRows: {
        about: [
          {
            name: 'Tiago',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
        ],
        home: [],
        contact_info: [],
        socials: [],
        platforms: [],
        solutions: [],
        skills: [],
        educations: [],
        experiences: [],
        impact_metrics: [],
        metric_sources: [],
      },
      existingRows: {
        about: [],
      },
    });

    expect(plan.summary.create).toBe(1);
    expect(plan.operations[0]?.action).toBe('create');
    expect(plan.operations[0]?.tableId).toBe('about');
  });

  it('plans update when uniqueLogicKeys match has changed fields', () => {
    const service = new SeederService();

    const plan = service.buildUpsertPlan({
      validatedRows: {
        about: [
          {
            name: 'Tiago',
            title: 'Senior Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
        ],
        home: [],
        contact_info: [],
        socials: [],
        platforms: [],
        solutions: [],
        skills: [],
        educations: [],
        experiences: [],
        impact_metrics: [],
        metric_sources: [],
      },
      existingRows: {
        about: [
          {
            id: 'about-1',
            name: 'Tiago',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
        ],
      },
    });

    expect(plan.summary.update).toBe(1);
    expect(plan.operations[0]?.action).toBe('update');
    expect(plan.operations[0]?.rowId).toBe('about-1');
  });

  it('plans ignore when uniqueLogicKeys match has identical payload', () => {
    const service = new SeederService();

    const plan = service.buildUpsertPlan({
      validatedRows: {
        about: [
          {
            name: 'Tiago',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
        ],
        home: [],
        contact_info: [],
        socials: [],
        platforms: [],
        solutions: [],
        skills: [],
        educations: [],
        experiences: [],
        impact_metrics: [],
        metric_sources: [],
      },
      existingRows: {
        about: [
          {
            id: 'about-1',
            name: 'Tiago',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
        ],
      },
    });

    expect(plan.summary.ignore).toBe(1);
    expect(plan.operations[0]?.action).toBe('ignore');
    expect(plan.operations[0]?.rowId).toBe('about-1');
  });

  it('preserves language-aware uniqueness by allowing distinct locales', () => {
    const service = new SeederService();

    const plan = service.buildUpsertPlan({
      validatedRows: {
        about: [
          {
            name: 'Tiago',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'pt',
          },
        ],
        home: [],
        contact_info: [],
        socials: [],
        platforms: [],
        solutions: [],
        skills: [],
        educations: [],
        experiences: [],
        impact_metrics: [],
        metric_sources: [],
      },
      existingRows: {
        about: [
          {
            id: 'about-1',
            name: 'Tiago',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
        ],
      },
    });

    expect(plan.summary.create).toBe(1);
    expect(plan.operations[0]?.action).toBe('create');
  });

  it('ignores duplicate rows from the same batch using uniqueLogicKeys', () => {
    const service = new SeederService();

    const plan = service.buildUpsertPlan({
      validatedRows: {
        about: [
          {
            name: 'Tiago',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
          {
            name: 'Tiago',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
        ],
        home: [],
        contact_info: [],
        socials: [],
        platforms: [],
        solutions: [],
        skills: [],
        educations: [],
        experiences: [],
        impact_metrics: [],
        metric_sources: [],
      },
      existingRows: {
        about: [],
      },
    });

    expect(plan.summary.create).toBe(1);
    expect(plan.summary.ignore).toBe(1);
    expect(plan.operations[1]?.action).toBe('ignore');
  });

  it('throws when multiple remote rows match the same unique logic key', () => {
    const service = new SeederService();

    expect(() =>
      service.buildUpsertPlan({
        validatedRows: {
          about: [
            {
              name: 'Tiago',
              title: 'Engineer',
              bio: 'Building clean systems',
              locale: 'en',
            },
          ],
          home: [],
          contact_info: [],
          socials: [],
          platforms: [],
          solutions: [],
          skills: [],
          educations: [],
          experiences: [],
          impact_metrics: [],
          metric_sources: [],
        },
        existingRows: {
          about: [
            {
              id: 'about-1',
              name: 'Tiago',
              title: 'Engineer',
              bio: 'Building clean systems',
              locale: 'en',
            },
            {
              id: 'about-2',
              name: 'Tiago duplicate',
              title: 'Engineer',
              bio: 'Building clean systems',
              locale: 'en',
            },
          ],
        },
      }),
    ).toThrow(SeedDeduplicationError);
  });

  it('Class 1: executes upsert plan successfully with create/update/ignore', async () => {
    const service = new SeederService();

    const plan = {
      operations: [
        {
          tableId: asTableId('about') as SeedTableId,
          rowIndex: 0,
          action: 'create' as const,
          data: { locale: 'en', name: 'Tiago' },
        },
        {
          tableId: asTableId('about') as SeedTableId,
          rowIndex: 1,
          action: 'update' as const,
          rowId: 'about-1',
          data: { locale: 'en', name: 'Tiago Updated' },
        },
        {
          tableId: asTableId('about') as SeedTableId,
          rowIndex: 2,
          action: 'ignore' as const,
          rowId: 'about-2',
          data: { locale: 'pt', name: 'Tiago' },
        },
      ],
      summary: {
        create: 1,
        update: 1,
        ignore: 1,
      },
    };

    const calls: string[] = [];

    const stats = await service.executeUpsertPlan({
      plan,
      executeOperation: async (operation) => {
        calls.push(`${operation.action}:${operation.rowIndex}`);
      },
    });

    expect(stats).toEqual({
      processed: 3,
      created: 1,
      updated: 1,
      ignored: 1,
      retries: 0,
    });

    expect(calls).toEqual(['create:0', 'update:1']);
  });

  it('Class 2: handles empty JSON payload as valid empty seed set', () => {
    const service = new SeederService();

    const validated = service.validateRows({});
    const plan = service.buildUpsertPlan({
      validatedRows: validated,
      existingRows: {},
    });

    expect(validated.about).toEqual([]);
    expect(validated.metric_sources).toEqual([]);
    expect(plan.operations).toHaveLength(0);
    expect(plan.summary).toEqual({
      create: 0,
      update: 0,
      ignore: 0,
    });
  });

  it('Class 5: retries on rate limiting 429 and succeeds', async () => {
    const service = new SeederService();

    const plan = {
      operations: [
        {
          tableId: asTableId('about') as SeedTableId,
          rowIndex: 0,
          action: 'create' as const,
          data: { locale: 'en', name: 'Tiago' },
        },
      ],
      summary: {
        create: 1,
        update: 0,
        ignore: 0,
      },
    };

    let attempts = 0;

    const stats = await service.executeUpsertPlan({
      plan,
      maxRetries: 3,
      retryDelayMs: 0,
      executeOperation: async () => {
        attempts += 1;
        if (attempts < 3) {
          throw { code: 429 };
        }
      },
    });

    expect(attempts).toBe(3);
    expect(stats.retries).toBe(2);
    expect(stats.created).toBe(1);
    expect(stats.processed).toBe(1);
  });

  it('Class 5: throws SeedRateLimitError after exhausting retries on 429', async () => {
    const service = new SeederService();

    const plan = {
      operations: [
        {
          tableId: asTableId('about') as SeedTableId,
          rowIndex: 0,
          action: 'create' as const,
          data: { locale: 'en', name: 'Tiago' },
        },
      ],
      summary: {
        create: 1,
        update: 0,
        ignore: 0,
      },
    };

    await expect(
      service.executeUpsertPlan({
        plan,
        maxRetries: 1,
        retryDelayMs: 0,
        executeOperation: async () => {
          throw { code: 429 };
        },
      }),
    ).rejects.toBeInstanceOf(SeedRateLimitError);
  });

  it('accepts valid payload and keeps empty tables by default', () => {
    const service = new SeederService();

    const result = service.validateRows({
      about: [
        {
          name: 'Tiago',
          title: 'Engineer',
          bio: 'Building clean systems',
          locale: 'en',
        },
      ],
      skills: [
        {
          title: 'TypeScript',
          type: 'frontend',
          iconCode: 'ts',
          status: 'active',
          sort: 1,
        },
      ],
    });

    expect(result.about).toHaveLength(1);
    expect(result.skills).toHaveLength(1);
    expect(result.platforms).toEqual([]);
  });

  it('rejects rows that violate the corresponding table schema', () => {
    const service = new SeederService();

    expect(() =>
      service.validateRows({
        about: [
          {
            name: 'Tiago',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'es',
          },
        ],
      }),
    ).toThrow(SeedValidationError);
  });

  it('rejects invalid email format in contact_info records', () => {
    const service = new SeederService();

    expect(() =>
      service.validateRows({
        contact_info: [
          {
            locale: 'en',
            email: 'not-an-email',
            phone: '+55 11 99999-9999',
            location: 'Sao Paulo',
          },
        ],
      }),
    ).toThrow(SeedValidationError);
  });

  it('rejects whitespace-only strings by API-level constraints', () => {
    const service = new SeederService();

    expect(() =>
      service.validateRows({
        about: [
          {
            name: '   ',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
        ],
      }),
    ).toThrow(SeedValidationError);
  });

  it('rejects strings exceeding blueprint max size', () => {
    const service = new SeederService();

    try {
      service.validateRows({
        skills: [
          {
            title: 'A'.repeat(65),
            type: 'frontend',
            iconCode: 'ts',
            status: 'active',
            sort: 1,
          },
        ],
      });
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(SeedValidationError);
      const validation = error as SeedValidationError;
      expect(validation.failures).toHaveLength(1);
      expect(validation.failures[0]?.tableId).toBe('skills');
      expect(validation.failures[0]?.rowIndex).toBe(0);
      expect(
        validation.failures[0]?.issues.some((issue) => issue.path === 'title'),
      ).toBe(true);
    }
  });

  it('aggregates API-level failures from multiple tables', () => {
    const service = new SeederService();

    try {
      service.validateRows({
        about: [
          {
            name: '   ',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
        ],
        skills: [
          {
            title: 'A'.repeat(65),
            type: 'frontend',
            iconCode: 'ts',
            status: 'active',
            sort: 1,
          },
        ],
      });
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(SeedValidationError);
      const validation = error as SeedValidationError;

      expect(validation.failures).toHaveLength(2);
      expect(validation.failures[0]?.tableId).toBe('about');
      expect(validation.failures[1]?.tableId).toBe('skills');
    }
  });

  it('reports table and row index for invalid rows', () => {
    const service = new SeederService();

    try {
      service.validateRows({
        skills: [
          {
            title: 'TypeScript',
            type: 'frontend',
            iconCode: 'ts',
            status: 'active',
            sort: 1,
          },
          {
            title: '',
            type: 'invalid-type',
            iconCode: 'x',
            status: 'active',
            sort: 2,
          },
        ],
      });
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(SeedValidationError);
      const validation = error as SeedValidationError;

      expect(validation.failures).toHaveLength(1);
      expect(validation.failures[0]?.tableId).toBe('skills');
      expect(validation.failures[0]?.rowIndex).toBe(1);
      expect(validation.failures[0]?.issues.length).toBeGreaterThan(0);
    }
  });

  it('rejects unknown table keys in payload', () => {
    const service = new SeederService();

    expect(() =>
      service.validateRows({
        about: [],
        unknown_table: [{ any: 'value' }],
      }),
    ).toThrow();
  });
});
