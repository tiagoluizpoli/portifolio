import { expect, test } from 'vitest';
import { assetUrl } from './assets';

test('prefixes the base URL, tolerating stray slashes', () => {
  expect(assetUrl('abc.pdf', 'https://cdn.example/bucket')).toBe('https://cdn.example/bucket/abc.pdf');
  expect(assetUrl('/abc.pdf', 'https://cdn.example/bucket/')).toBe('https://cdn.example/bucket/abc.pdf');
});
