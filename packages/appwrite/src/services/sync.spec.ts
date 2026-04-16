import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initializeAppwrite } from '../client.js';
import {
  AppwriteCatastrophicConfigError,
  AppwritePermissionException,
  AppwriteSystemException,
} from '../errors/appwrite-errors.js';
import type {
  IImpactMetricRepository,
  ImpactMetricEntity,
} from '../repositories/interfaces.js';
import { MetricSyncService } from './sync.js';

function makeSource(
  overrides: Partial<ImpactMetricEntity> = {},
): ImpactMetricEntity {
  return {
    id: 'metric-en',
    aboutId: 'about-1',
    internalCode: 'clients-served',
    locale: 'en',
    label: 'Clients served',
    value: '200+',
    sourceId: 'source-1',
    isPlaceholder: false,
    ...overrides,
  };
}

describe('MetricSyncService', () => {
  let repository: IImpactMetricRepository;

  beforeEach(() => {
    repository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByInternalCode: vi.fn(),
      findByAboutAndInternalCode: vi.fn(),
    };

    process.env.APPWRITE_DATABASE_ID = 'db';
  });

  it('Class 1 creates counterpart ghost row when missing', async () => {
    vi.mocked(repository.findByAboutAndInternalCode).mockResolvedValue([]);
    vi.mocked(repository.create)
      .mockResolvedValueOnce(makeSource())
      .mockResolvedValueOnce(makeSource({ id: 'metric-pt', locale: 'pt' }));

    const service = new MetricSyncService(repository);
    await service.sync('about-1', makeSource());

    expect(repository.create).toHaveBeenCalledTimes(2);
    expect(repository.create).toHaveBeenNthCalledWith(2, {
      aboutId: 'about-1',
      internalCode: 'clients-served',
      locale: 'pt',
      label: 'Clients served',
      value: '200+',
      sourceId: 'source-1',
      isPlaceholder: true,
    });
  });

  it('Class 1 updates existing counterpart metadata', async () => {
    vi.mocked(repository.findByAboutAndInternalCode).mockResolvedValue([
      makeSource(),
      makeSource({
        id: 'metric-pt',
        locale: 'pt',
        label: 'Clientes atendidos',
        value: '200+',
        isPlaceholder: true,
      }),
    ]);

    const service = new MetricSyncService(repository);
    await service.sync('about-1', makeSource());

    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith('metric-pt', {
      sourceId: 'source-1',
      isPlaceholder: true,
    });
  });

  it('Class 6 avoids duplicate source row when source already exists', async () => {
    vi.mocked(repository.findByAboutAndInternalCode).mockResolvedValue([
      makeSource(),
    ]);
    vi.mocked(repository.create).mockResolvedValue(
      makeSource({ id: 'metric-pt', locale: 'pt' }),
    );

    const service = new MetricSyncService(repository);
    await service.sync('about-1', makeSource());

    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  it('Class 7 cleanup removes placeholder rows only', async () => {
    vi.mocked(repository.findByAboutAndInternalCode).mockResolvedValue([
      makeSource(),
      makeSource({ id: 'metric-pt', locale: 'pt', isPlaceholder: true }),
    ]);

    const service = new MetricSyncService(repository);
    await service.cleanup('about-1', 'clients-served');

    expect(repository.delete).toHaveBeenCalledTimes(1);
    expect(repository.delete).toHaveBeenCalledWith('metric-pt');
  });

  it('creates EN ghost row when source locale is PT', async () => {
    vi.mocked(repository.findByAboutAndInternalCode).mockResolvedValue([
      makeSource({
        id: 'metric-pt-source',
        locale: 'pt',
        label: 'Clientes atendidos',
      }),
    ]);
    vi.mocked(repository.create).mockResolvedValue(
      makeSource({ id: 'metric-en', locale: 'en' }),
    );

    const service = new MetricSyncService(repository);
    await service.sync(
      'about-1',
      makeSource({
        id: 'metric-pt-source',
        locale: 'pt',
        label: 'Clientes atendidos',
      }),
    );

    expect(repository.create).toHaveBeenCalledWith({
      aboutId: 'about-1',
      internalCode: 'clients-served',
      locale: 'en',
      label: 'Clientes atendidos',
      value: '200+',
      sourceId: 'source-1',
      isPlaceholder: true,
    });
  });

  it('maps sync failures to system exception', async () => {
    vi.mocked(repository.findByAboutAndInternalCode).mockRejectedValue({
      code: 500,
    });

    const service = new MetricSyncService(repository);
    await expect(service.sync('about-1', makeSource())).rejects.toBeInstanceOf(
      AppwriteSystemException,
    );
  });

  it('rolls back newly created source when counterpart creation fails', async () => {
    vi.mocked(repository.findByAboutAndInternalCode).mockResolvedValue([]);
    vi.mocked(repository.create)
      .mockResolvedValueOnce(makeSource({ id: 'created-source' }))
      .mockRejectedValueOnce({ code: 500 });

    const service = new MetricSyncService(repository);

    await expect(service.sync('about-1', makeSource())).rejects.toBeInstanceOf(
      AppwriteSystemException,
    );
    expect(repository.delete).toHaveBeenCalledWith('created-source');
  });

  it('does not rollback when source already existed and update fails', async () => {
    vi.mocked(repository.findByAboutAndInternalCode).mockResolvedValue([
      makeSource(),
      makeSource({ id: 'metric-pt', locale: 'pt', isPlaceholder: true }),
    ]);
    vi.mocked(repository.update).mockRejectedValue({ code: 500 });

    const service = new MetricSyncService(repository);

    await expect(service.sync('about-1', makeSource())).rejects.toBeInstanceOf(
      AppwriteSystemException,
    );
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('surfaces rollback failure mapping when compensating delete fails', async () => {
    vi.mocked(repository.findByAboutAndInternalCode).mockResolvedValue([]);
    vi.mocked(repository.create)
      .mockResolvedValueOnce(makeSource({ id: 'created-source' }))
      .mockRejectedValueOnce({ code: 500 });
    vi.mocked(repository.delete).mockRejectedValue({ code: 403 });

    const service = new MetricSyncService(repository);

    await expect(service.sync('about-1', makeSource())).rejects.toBeInstanceOf(
      AppwritePermissionException,
    );
  });

  it('maps cleanup failures to system exception', async () => {
    vi.mocked(repository.findByAboutAndInternalCode).mockRejectedValue({
      code: 500,
    });

    const service = new MetricSyncService(repository);
    await expect(
      service.cleanup('about-1', 'clients-served'),
    ).rejects.toBeInstanceOf(AppwriteSystemException);
  });

  it('throws catastrophic config error when default repository is used without DB env', () => {
    delete process.env.APPWRITE_DATABASE_ID;

    expect(() => new MetricSyncService()).toThrow(
      AppwriteCatastrophicConfigError,
    );
  });

  it('builds default repository when DB env is present', () => {
    initializeAppwrite({
      endpoint: 'http://localhost/v1',
      projectId: 'project',
    });
    process.env.APPWRITE_DATABASE_ID = 'db';

    expect(() => new MetricSyncService()).not.toThrow();
  });
});
