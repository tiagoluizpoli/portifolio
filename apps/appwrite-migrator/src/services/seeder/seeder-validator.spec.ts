import { describe, expect, it } from 'vitest';
import { SeederValidator, SeedValidationError } from './seeder-validator';

describe('SeederValidator', () => {
  it('accepts valid payload and defaults unspecified tables to empty arrays', () => {
    const validator = new SeederValidator();

    const result = validator.validateRows({
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

  it('rejects rows that violate table schema constraints', () => {
    const validator = new SeederValidator();

    expect(() =>
      validator.validateRows({
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
    const validator = new SeederValidator();

    expect(() =>
      validator.validateRows({
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

  it('rejects missing required fields by schema constraints', () => {
    const validator = new SeederValidator();

    expect(() =>
      validator.validateRows({
        about: [
          {
            // name missing
            title: 'Engineer',
            bio: 'Building clean systems',
            locale: 'en',
          },
        ],
      }),
    ).toThrow(SeedValidationError);
  });

  it('rejects strings exceeding blueprint max size', () => {
    const validator = new SeederValidator();

    try {
      validator.validateRows({
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

  it('aggregates failures from multiple tables', () => {
    const validator = new SeederValidator();

    try {
      validator.validateRows({
        about: [
          {
            // name missing
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
});
