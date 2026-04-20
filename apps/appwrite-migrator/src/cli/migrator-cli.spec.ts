import { describe, expect, it } from 'vitest';
import { MOCK_CONFIG } from '../tests/helpers/config.mock';
import { parseCliConfig } from './cli-config';
import { MigratorCli } from '@/cli/migrator-cli';

class MigratorCliTestHarness extends MigratorCli {
  buildContextWithConfigForTest(argv: string[]) {
    const cliConfig = parseCliConfig(argv);
    return this.buildContextWithConfig(cliConfig, MOCK_CONFIG);
  }
}

describe('MigratorCli', () => {
  it('detects --check mode', () => {
    const cli = new MigratorCliTestHarness();
    const context = cli.buildContextWithConfigForTest(['--check']);
    expect(context.mode).toBe('check');
  });

  it('detects --migrate mode', () => {
    const cli = new MigratorCliTestHarness();
    const context = cli.buildContextWithConfigForTest(['--migrate']);
    expect(context.mode).toBe('migrate');
  });

  it('detects --seed mode', () => {
    const cli = new MigratorCliTestHarness();
    const context = cli.buildContextWithConfigForTest(['--seed']);
    expect(context.mode).toBe('seed');
  });

  it('detects --template mode', () => {
    const cli = new MigratorCliTestHarness();
    const context = cli.buildContextWithConfigForTest(['--template']);
    expect(context.mode).toBe('template');
  });

  it('parses --env, --payload, and --output flags', () => {
    const cli = new MigratorCliTestHarness();
    const context = cli.buildContextWithConfigForTest([
      '--seed',
      '--env',
      'staging',
      '--payload',
      'data.json',
      '--output',
      'res.json',
      '--force',
    ]);
    expect(context.env).toBe('staging');
    expect(context.payload).toBe('data.json');
    expect(context.output).toBe('res.json');
    expect(context.force).toBe(true);
  });

  it('throws error when multiple modes are provided', () => {
    const cli = new MigratorCliTestHarness();
    expect(() => {
      cli.buildContextWithConfigForTest(['--seed', '--migrate']);
    }).toThrow(/Only one mode/);
  });

  it('throws error when no mode is provided', () => {
    const cli = new MigratorCliTestHarness();
    expect(() => {
      cli.buildContextWithConfigForTest([]);
    }).toThrow(/Mode flag is required/);
  });

  it('throws error for unrecognized flags', () => {
    const cli = new MigratorCliTestHarness();
    expect(() => {
      cli.buildContextWithConfigForTest(['--seed', '--unknown']);
    }).toThrow(/unknown option/i);
  });
});
