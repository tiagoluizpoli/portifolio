import { describe, expect, it, vi } from 'vitest';
import type { ImpactMetric } from '../cms/chapters/metrics.js';
import type { IMetricRepository } from '../repositories/interfaces.js';
import { MetricSyncService } from './metric-sync.service.js';

describe('MetricSyncService', () => {
  const mockRepo = {
    findByParity: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  } as unknown as IMetricRepository;

  const service = new MetricSyncService(mockRepo);

  it('should create ghost rows for missing locales', async () => {
    const sourceMetric: ImpactMetric = {
      id: 'm1',
      aboutId: 'about1',
      internalCode: 'active-users',
      locale: 'en',
      label: 'Active Users',
      value: '100',
      sourceId: 'manual',
    };

    // PT locale has no metrics
    vi.mocked(mockRepo.findByParity).mockResolvedValue(null);

    await service.sync('about1', sourceMetric);

    // Should have checked PT
    expect(mockRepo.findByParity).toHaveBeenCalledWith(
      'about1',
      'pt',
      'active-users',
    );

    // Should have created new PT metric
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        internalCode: 'active-users',
        locale: 'pt',
        label: '[PT] New Impact',
      }),
    );
  });

  it('should update metadata for existing parity rows', async () => {
    const sourceMetric: ImpactMetric = {
      id: 'm1',
      aboutId: 'about1',
      internalCode: 'active-users',
      locale: 'en',
      label: 'Active Users',
      value: '100',
      sourceId: 'system-1',
      sourceKey: 'new-key',
      prefix: '+',
      suffix: '%',
    };

    const existingPtMetric: ImpactMetric = {
      id: 'm2',
      aboutId: 'about1',
      internalCode: 'active-users',
      locale: 'pt',
      label: 'Usuários Ativos',
      value: '50',
      sourceId: 'old-source',
    };

    vi.mocked(mockRepo.findByParity).mockResolvedValue(existingPtMetric);

    await service.sync('about1', sourceMetric);

    expect(mockRepo.update).toHaveBeenCalledWith(
      'm2',
      expect.objectContaining({
        sourceId: 'system-1',
        sourceKey: 'new-key',
        prefix: '+',
        suffix: '%',
      }),
    );
  });
});
