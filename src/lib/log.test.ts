import { expect, test } from 'vitest';
import { createLogger } from './log';

test('writes one JSON line with level and message; errors never leak beyond name+message', () => {
  const lines: string[] = [];
  const log = createLogger((l) => lines.push(l));
  const error = Object.assign(new Error('boom'), { cause: { headers: { authorization: 'Bearer ghp_SECRET' } } });
  log.error('stats failed', { error });
  log.info('boot');
  expect(lines).toHaveLength(2);
  expect(JSON.parse(lines[0])).toMatchObject({ level: 'error', message: 'stats failed', error: { message: 'boom' } });
  expect(JSON.parse(lines[1])).toMatchObject({ level: 'info', message: 'boot' });
  expect(lines.join('')).not.toContain('ghp_SECRET');
});
