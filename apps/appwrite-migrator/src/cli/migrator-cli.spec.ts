import { describe, expect, it } from 'vitest';
import { MOCK_CONFIG } from '../tests/helpers/config.mock';
import { MigratorCli } from '@/cli/migrator-cli';

describe('MigratorCli', () => {
  it('detects --check mode', () => {
    const cli =
      new // biome-ignore lint/suspicious/noExplicitAny: access private methods for testing
      (MigratorCli as any)();
    const flags = cli.parseFlags(['--check']);
    const context = cli.buildContextWithConfig(flags, MOCK_CONFIG);
    expect(context.mode).toBe('check');
  });

  it('detects --migrate mode', () => {
    const cli =
      new // biome-ignore lint/suspicious/noExplicitAny: access private methods for testing
      (MigratorCli as any)();
    const flags = cli.parseFlags(['--migrate']);
    const context = cli.buildContextWithConfig(flags, MOCK_CONFIG);
    expect(context.mode).toBe('migrate');
  });

  it('detects --seed mode', () => {
    const cli =
      new // biome-ignore lint/suspicious/noExplicitAny: access private methods for testing
      (MigratorCli as any)();
    const flags = cli.parseFlags(['--seed']);
    const context = cli.buildContextWithConfig(flags, MOCK_CONFIG);
    expect(context.mode).toBe('seed');
  });

  it('detects --template mode', () => {
    const cli =
      new // biome-ignore lint/suspicious/noExplicitAny: access private methods for testing
      (MigratorCli as any)();
    const flags = cli.parseFlags(['--template']);
    const context = cli.buildContextWithConfig(flags, MOCK_CONFIG);
    expect(context.mode).toBe('template');
  });

  it('parses --env, --payload, and --output flags', () => {
    const cli =
      new // biome-ignore lint/suspicious/noExplicitAny: access private methods for testing
      (MigratorCli as any)();
    const flags = cli.parseFlags([
      '--seed',
      '--env',
      'staging',
      '--payload',
      'data.json',
      '--output',
      'res.json',
      '--force',
    ]);
    const context = cli.buildContextWithConfig(flags, MOCK_CONFIG);
    expect(context.env).toBe('staging');
    expect(context.payload).toBe('data.json');
    expect(context.output).toBe('res.json');
    expect(context.force).toBe(true);
  });

  it('throws error when multiple modes are provided', () => {
    const cli =
      new // biome-ignore lint/suspicious/noExplicitAny: access private methods for testing
      (MigratorCli as any)();
    const flags = cli.parseFlags(['--seed', '--migrate']);
    expect(() => {
      cli.buildContextWithConfig(flags, MOCK_CONFIG);
    }).toThrow(/Only one mode/);
  });

  it('throws error when no mode is provided', () => {
    const cli =
      new // biome-ignore lint/suspicious/noExplicitAny: access private methods for testing
      (MigratorCli as any)();
    const flags = cli.parseFlags([]);
    expect(() => {
      cli.buildContextWithConfig(flags, MOCK_CONFIG);
    }).toThrow(/Mode flag is required/);
  });
});
