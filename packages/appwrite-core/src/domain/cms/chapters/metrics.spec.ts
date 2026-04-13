import { describe, expect, it } from 'vitest';
import type { ImpactMetric } from './metrics.js';

describe('ImpactMetric Domain Entity', () => {
  it('should support semantic parity fields', () => {
    const metric: ImpactMetric = {
      id: 'metric-1',
      aboutId: 'about-1',
      internalCode: 'active-users',
      locale: 'en',
      label: 'Active Users',
      value: '100+',
      sourceId: 'src-1',
      isPlaceholder: false,
    };

    expect(metric.internalCode).toBe('active-users');
    expect(metric.locale).toBe('en');
    expect(metric.sourceId).toBe('src-1');
  });
});
