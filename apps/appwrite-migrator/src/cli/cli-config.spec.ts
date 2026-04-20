import { describe, expect, it } from 'vitest';
import { parseCliConfig } from './cli-config';

describe('parseCliConfig', () => {
  it('parses valid seed flags', () => {
    const parsed = parseCliConfig([
      '--seed',
      '--env',
      '.env.staging',
      '--payload',
      'seed.json',
      '--output',
      'result.json',
      '--force',
    ]);

    expect(parsed).toEqual({
      mode: 'seed',
      env: '.env.staging',
      payload: 'seed.json',
      output: 'result.json',
      force: true,
    });
  });

  it('rejects multiple active mode flags', () => {
    expect(() => parseCliConfig(['--seed', '--migrate'])).toThrow(
      /Only one mode can be active/,
    );
  });

  it('rejects missing mode flag', () => {
    expect(() => parseCliConfig(['--force'])).toThrow(/Mode flag is required/);
  });

  it('rejects unknown flags', () => {
    expect(() => parseCliConfig(['--seed', '--unknown'])).toThrow(
      /unknown option/i,
    );
  });
});
