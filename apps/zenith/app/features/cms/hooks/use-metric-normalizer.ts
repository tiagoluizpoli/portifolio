import type { ImpactMetric, MetricSource } from '@repo/appwrite-core/domain';
import { useMemo } from 'react';

/**
 * useMetricNormalizer
 * Implements AD-001 Metric Normalization logic.
 * Resolves icons using system precedence: Metric Metadata > Source Default.
 */
export function useMetricNormalizer(
  metrics: ImpactMetric[] = [],
  sources: MetricSource[] = [],
) {
  return useMemo(() => {
    return metrics.map((metric) => {
      const source = sources.find((s) => s.id === metric.sourceId);

      return {
        ...metric,
        // iconCode precedence: Metric override -> Source default -> fallback
        resolvedIcon: metric.iconCode || source?.iconCode || 'lucide:activity',
        sourceName: source?.name || 'Manual',
        isAutomated: source?.type === 'automated',
      };
    });
  }, [metrics, sources]);
}
