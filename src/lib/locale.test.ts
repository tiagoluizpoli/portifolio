import { expect, test } from 'vitest';
import { locales } from './locale';

test('supports en and pt', () => {
  expect(locales).toEqual(['en', 'pt']);
});
