import { describe, expect, it } from 'vitest';
import { DocumentMapper } from './mapper';

describe('DocumentMapper', () => {
  it('maps appwrite system fields to domain fields', () => {
    const mapped = DocumentMapper.toDomain<{ id: string; label: string }>({
      $id: 'doc_1',
      $createdAt: '2026-04-16T00:00:00.000Z',
      $updatedAt: '2026-04-16T01:00:00.000Z',
      $permissions: ['read("*")'],
      label: 'hello',
    });

    expect(mapped).toEqual({
      id: 'doc_1',
      createdAt: '2026-04-16T00:00:00.000Z',
      updatedAt: '2026-04-16T01:00:00.000Z',
      permissions: ['read("*")'],
      label: 'hello',
    });
  });

  it('removes domain system fields for appwrite writes', () => {
    const mapped = DocumentMapper.toAppwrite({
      id: 'doc_1',
      createdAt: 'x',
      updatedAt: 'y',
      permissions: ['*'],
      label: 'hello',
      value: 10,
    });

    expect(mapped).toEqual({ label: 'hello', value: 10 });
  });

  it('keeps plain domain payload unchanged when system fields are absent', () => {
    const mapped = DocumentMapper.toDomain<{ label: string }>({
      label: 'only-data',
    });

    expect(mapped).toEqual({ label: 'only-data' });
  });
});
