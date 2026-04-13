import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ImpactMetric } from '../cms/chapters/metrics.js';
import type { IMetricRepository } from '../repositories/interfaces.js';
import { MetricSyncService } from './metric-sync.service.js';

describe('MetricSyncService', () => {
  let metricRepo: IMetricRepository;
  let service: MetricSyncService;
  const locales = ['en', 'pt'];

  beforeEach(() => {
    metricRepo = {
      findByParity: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByLocale: vi.fn(),
      save: vi.fn(),
      deleteByInternalCode: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    } as unknown as IMetricRepository;

    service = new MetricSyncService(metricRepo, locales);
  });

  const mockMetric: ImpactMetric = {
    id: 'm1',
    aboutId: 'a1',
    internalCode: 'test-metric',
    locale: 'en',
    label: 'Test Metric',
    value: '100',
    sourceId: 'manual',
    isPlaceholder: false,
  };

  it('should create a Ghost Row if parity metric does not exist', async () => {
    vi.mocked(metricRepo.findByParity).mockResolvedValue(null);
    vi.mocked(metricRepo.create).mockResolvedValue({
      id: 'ghost-1',
    } as ImpactMetric);

    await service.sync('a1', mockMetric);

    expect(metricRepo.findByParity).toHaveBeenCalledWith(
      'a1',
      'pt',
      'test-metric',
    );
    expect(metricRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'pt',
        internalCode: 'test-metric',
        isPlaceholder: true,
        label: '[PT] New Metric (Draft)',
      }),
    );
  });

  it('should mirror metadata if parity metric exists', async () => {
    const existing: ImpactMetric = {
      id: 'm2',
      aboutId: 'a1',
      internalCode: 'test-metric',
      locale: 'pt',
      label: 'Metric PT',
      value: '0',
      sourceId: 'manual',
      isPlaceholder: true,
    };

    vi.mocked(metricRepo.findByParity).mockResolvedValue(existing);

    await service.sync('a1', {
      ...mockMetric,
      prefix: '$',
      sourceId: 'github',
    });

    expect(metricRepo.update).toHaveBeenCalledWith(
      'm2',
      expect.objectContaining({
        prefix: '$',
        sourceId: 'github',
        isPlaceholder: false, // Should become false if source is false and we are syncing
      }),
    );
  });

  it('should rollback created Ghost Rows on failure', async () => {
    vi.mocked(metricRepo.findByParity).mockResolvedValue(null);
    vi.mocked(metricRepo.create).mockResolvedValueOnce({
      id: 'ghost-1',
    } as ImpactMetric);
    vi.mocked(metricRepo.create).mockRejectedValueOnce(
      new Error('Appwrite Fail'),
    );

    const serviceWithThreeFields = new MetricSyncService(metricRepo, [
      'en',
      'pt',
      'es',
    ]);

    await expect(serviceWithThreeFields.sync('a1', mockMetric)).rejects.toThrow(
      'Appwrite Fail',
    );

    expect(metricRepo.delete).toHaveBeenCalledWith('ghost-1');
  });
});
