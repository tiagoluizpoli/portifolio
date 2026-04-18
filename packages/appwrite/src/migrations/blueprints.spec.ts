import { describe, expect, it } from 'vitest';
import {
  BlueprintsSchema,
  blueprints,
  COLUMN_KEY_REGEX,
  TABLE_ID_REGEX,
  TableBlueprintSchema,
} from './blueprints';

describe('Blueprint schemas', () => {
  it('accepts the current blueprint set', () => {
    expect(BlueprintsSchema.parse(blueprints)).toEqual(blueprints);
  });

  it('requires uniqueLogicKeys in each table', () => {
    const invalid = {
      ...blueprints[0],
      uniqueLogicKeys: {},
    };

    expect(() => TableBlueprintSchema.parse(invalid)).toThrow();
  });

  it('rejects unknown uniqueLogicKeys', () => {
    const invalid = {
      ...blueprints[0],
      uniqueLogicKeys: {
        byInvalidField: ['notAColumn'],
      },
    };

    expect(() => TableBlueprintSchema.parse(invalid)).toThrow();
  });

  it('enforces table and column naming regexes', () => {
    expect(TABLE_ID_REGEX.test('about')).toBe(true);
    expect(TABLE_ID_REGEX.test('About')).toBe(false);
    expect(TABLE_ID_REGEX.test('1about')).toBe(false);

    expect(COLUMN_KEY_REGEX.test('heroTitle')).toBe(true);
    expect(COLUMN_KEY_REGEX.test('1heroTitle')).toBe(false);
    expect(COLUMN_KEY_REGEX.test('hero-title')).toBe(false);
  });

  it('rejects duplicate table ids', () => {
    const duplicate = [blueprints[0], blueprints[0]];
    expect(() => BlueprintsSchema.parse(duplicate)).toThrow();
  });
});
