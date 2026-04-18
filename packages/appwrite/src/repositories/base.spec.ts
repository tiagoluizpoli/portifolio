import { describe, expect, it, vi } from 'vitest';
import { InternalLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

interface FakeEntity {
  id: string;
  name: string;
}

class FakeRepository extends BaseRepository<FakeEntity> {
  protected parse(entity: Record<string, unknown>): FakeEntity {
    return {
      id: String(entity.id),
      name: String(entity.name),
    };
  }

  async runQueryPublic(queries: string[]) {
    return this.runQuery(queries);
  }
}

class RawRepository extends BaseRepository<FakeEntity> {
  parsePublic(entity: Record<string, unknown>) {
    return this.parse(entity);
  }
}

function createSdk() {
  return {
    getRow: vi.fn(),
    listRows: vi.fn(),
    createRow: vi.fn(),
    updateRow: vi.fn(),
    deleteRow: vi.fn(),
  };
}

describe('BaseRepository', () => {
  it('findById maps document to domain entity', async () => {
    const sdk = createSdk();
    const logger = new InternalLogger();
    sdk.getRow.mockResolvedValue({ $id: '1', name: 'Ada' });

    const repository = new FakeRepository(
      sdk as unknown as never,
      'db',
      'col',
      logger,
    );

    await expect(repository.findById({ id: '1' })).resolves.toEqual({
      id: '1',
      name: 'Ada',
    });
  });

  it('findById returns null on 404', async () => {
    const sdk = createSdk();
    sdk.getRow.mockRejectedValue({ code: 404 });
    const repository = new FakeRepository(sdk as unknown as never, 'db', 'col');

    await expect(repository.findById({ id: '404' })).resolves.toBeNull();
  });

  it('findById rethrows unknown errors', async () => {
    const sdk = createSdk();
    const error = new Error('boom');
    sdk.getRow.mockRejectedValue(error);

    const repository = new FakeRepository(sdk as unknown as never, 'db', 'col');
    await expect(repository.findById({ id: '1' })).rejects.toBe(error);
  });

  it('findAll delegates to listRows with query limit', async () => {
    const sdk = createSdk();
    sdk.listRows.mockResolvedValue({
      rows: [{ $id: '1', name: 'One' }],
    });

    const repository = new FakeRepository(sdk as unknown as never, 'db', 'col');
    const result = await repository.findAll();

    expect(result).toEqual([{ id: '1', name: 'One' }]);
    expect(sdk.listRows).toHaveBeenCalledTimes(1);
  });

  it('create maps payload and result', async () => {
    const sdk = createSdk();
    sdk.createRow.mockResolvedValue({ $id: '1', name: 'New' });

    const repository = new FakeRepository(sdk as unknown as never, 'db', 'col');
    const created = await repository.create({ data: { name: 'New' } });

    expect(created).toEqual({ id: '1', name: 'New' });
    expect(sdk.createRow).toHaveBeenCalledTimes(1);
  });

  it('create rethrows sdk errors', async () => {
    const sdk = createSdk();
    const error = new Error('create failed');
    sdk.createRow.mockRejectedValue(error);

    const repository = new FakeRepository(sdk as unknown as never, 'db', 'col');
    await expect(repository.create({ data: { name: 'x' } })).rejects.toBe(
      error,
    );
  });

  it('update maps payload and result', async () => {
    const sdk = createSdk();
    sdk.updateRow.mockResolvedValue({ $id: '1', name: 'Updated' });

    const repository = new FakeRepository(sdk as unknown as never, 'db', 'col');
    const updated = await repository.update({
      id: '1',
      data: { name: 'Updated' },
    });

    expect(updated).toEqual({ id: '1', name: 'Updated' });
    expect(sdk.updateRow).toHaveBeenCalledTimes(1);
  });

  it('update rethrows sdk errors', async () => {
    const sdk = createSdk();
    const error = new Error('update failed');
    sdk.updateRow.mockRejectedValue(error);

    const repository = new FakeRepository(sdk as unknown as never, 'db', 'col');
    await expect(
      repository.update({ id: '1', data: { name: 'x' } }),
    ).rejects.toBe(error);
  });

  it('delete forwards sdk call', async () => {
    const sdk = createSdk();
    sdk.deleteRow.mockResolvedValue(undefined);

    const repository = new FakeRepository(sdk as unknown as never, 'db', 'col');
    await repository.delete({ id: '1' });

    expect(sdk.deleteRow).toHaveBeenCalledWith({
      databaseId: 'db',
      tableId: 'col',
      rowId: '1',
    });
  });

  it('delete rethrows sdk errors', async () => {
    const sdk = createSdk();
    const error = new Error('delete failed');
    sdk.deleteRow.mockRejectedValue(error);

    const repository = new FakeRepository(sdk as unknown as never, 'db', 'col');
    await expect(repository.delete({ id: '1' })).rejects.toBe(error);
  });

  it('runQuery returns parsed entities', async () => {
    const sdk = createSdk();
    sdk.listRows.mockResolvedValue({
      rows: [{ $id: '2', name: 'Two' }],
    });

    const repository = new FakeRepository(sdk as unknown as never, 'db', 'col');
    await expect(repository.runQueryPublic(['limit(10)'])).resolves.toEqual([
      { id: '2', name: 'Two' },
    ]);
  });

  it('runQuery rethrows sdk errors', async () => {
    const sdk = createSdk();
    const error = new Error('list failed');
    sdk.listRows.mockRejectedValue(error);

    const repository = new FakeRepository(sdk as unknown as never, 'db', 'col');
    await expect(repository.runQueryPublic(['limit(10)'])).rejects.toBe(error);
  });

  it('uses default parse implementation when not overridden', () => {
    const sdk = createSdk();
    const repository = new RawRepository(sdk as unknown as never, 'db', 'col');

    expect(repository.parsePublic({ id: '1', name: 'raw' })).toEqual({
      id: '1',
      name: 'raw',
    });
  });
});
