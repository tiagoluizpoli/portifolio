import { Query } from 'node-appwrite';
import { describe, expect, it, vi } from 'vitest';
import { QueryMapper } from './query-mapper';

vi.mock('node-appwrite', () => ({
  Query: {
    limit: vi.fn((val) => `limit(${val})`),
    offset: vi.fn((val) => `offset(${val})`),
  },
}));

describe('QueryMapper', () => {
  it('returns empty array when no options are provided', () => {
    const queries = QueryMapper.toAppwriteQueries();
    expect(queries).toEqual([]);
  });

  it('maps limit option correctly', () => {
    const queries = QueryMapper.toAppwriteQueries({ limit: 10 });
    expect(queries).toContain('limit(10)');
    expect(Query.limit).toHaveBeenCalledWith(10);
  });

  it('maps offset option correctly', () => {
    const queries = QueryMapper.toAppwriteQueries({ offset: 20 });
    expect(queries).toContain('offset(20)');
    expect(Query.offset).toHaveBeenCalledWith(20);
  });

  it('maps both limit and offset correctly', () => {
    const queries = QueryMapper.toAppwriteQueries({ limit: 50, offset: 100 });
    expect(queries).toEqual(['limit(50)', 'offset(100)']);
  });
});
