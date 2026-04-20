import { describe, expect, it } from 'vitest';
import {
  asBucketId,
  asFileId,
  asTableId,
  isBucketId,
  isFileId,
  isTableId,
} from './ids.js';

describe('repository ids', () => {
  it('casts branded ids from strings', () => {
    const tableId = asTableId('about');
    const bucketId = asBucketId('assets');
    const fileId = asFileId('file_123');

    expect(tableId).toBe('about');
    expect(bucketId).toBe('assets');
    expect(fileId).toBe('file_123');
  });

  it('validates branded id guard semantics', () => {
    expect(isTableId('about')).toBe(true);
    expect(isBucketId('assets')).toBe(true);
    expect(isFileId('file_123')).toBe(true);

    expect(isTableId('')).toBe(false);
    expect(isBucketId('   ')).toBe(false);
    expect(isFileId(null)).toBe(false);
  });
});
