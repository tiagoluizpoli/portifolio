import { describe, expect, it } from 'vitest';
import { SeedDeduplicationError, SeederPlanner } from './seeder-planner';
import type { ValidatedSeedPayload } from './seeder-validator';

function createValidatedRows(
  patch: Partial<ValidatedSeedPayload>,
): ValidatedSeedPayload {
  return {
    about: [],
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
    ...patch,
  };
}

describe('SeederPlanner', () => {
  it('plans create when no uniqueLogicKeys match exists remotely', () => {
    const planner = new SeederPlanner();

    const plan = planner.buildUpsertPlan({
      validatedRows: createValidatedRows({
        about: [
          {
            name: 'Tiago',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
        ],
      }),
      existingRows: {
        about: [],
      },
    });

    expect(plan.summary.create).toBe(1);
    expect(plan.operations[0]?.action).toBe('create');
    expect(plan.operations[0]?.tableId).toBe('about');
  });

  it('plans update when uniqueLogicKeys match has changed fields', () => {
    const planner = new SeederPlanner();

    const plan = planner.buildUpsertPlan({
      validatedRows: createValidatedRows({
        about: [
          {
            name: 'Tiago',
            title: 'Senior Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
        ],
      }),
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
    const planner = new SeederPlanner();

    const plan = planner.buildUpsertPlan({
      validatedRows: createValidatedRows({
        about: [
          {
            name: 'Tiago',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
        ],
      }),
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
    const planner = new SeederPlanner();

    const plan = planner.buildUpsertPlan({
      validatedRows: createValidatedRows({
        about: [
          {
            name: 'Tiago',
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'pt',
          },
        ],
      }),
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
    const planner = new SeederPlanner();

    const plan = planner.buildUpsertPlan({
      validatedRows: createValidatedRows({
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
      }),
      existingRows: {
        about: [],
      },
    });

    expect(plan.summary.create).toBe(1);
    expect(plan.summary.ignore).toBe(1);
    expect(plan.operations[1]?.action).toBe('ignore');
  });

  it('throws when multiple remote rows match the same unique logic key', () => {
    const planner = new SeederPlanner();

    expect(() =>
      planner.buildUpsertPlan({
        validatedRows: createValidatedRows({
          about: [
            {
              name: 'Tiago',
              title: 'Engineer',
              bio: 'Building clean systems',
              locale: 'en',
            },
          ],
        }),
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
});
