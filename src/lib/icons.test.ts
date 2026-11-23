import { expect, test } from 'vitest';
import { iconSvg, isKnownIcon } from './icons';

test('renders a known Iconify id as inline svg and rejects unknown ones', () => {
  expect(iconSvg('logos:typescript-icon')).toMatch(/^<svg[^>]*aria-hidden="true"/);
  expect(isKnownIcon('logos:nope-nope')).toBe(false);
  expect(isKnownIcon('mdi:home')).toBe(false);
  expect(iconSvg('mdi:home')).toBe('');
});
