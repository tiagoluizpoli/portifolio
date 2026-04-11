import type { ImpactMetric } from '../cms/chapters/metrics.js';
import type { IMetricRepository } from '../repositories/interfaces.js';

/**
 * MetricSyncService
 * Ensures semantic parity of impact metrics across all supported locales.
 * Implements the "Ghost Row" propagation engine (Constitution §XVII).
 */
export class MetricSyncService {
  constructor(
    private metricRepo: IMetricRepository,
    private supportedLocales: string[] = ['en', 'pt'],
  ) {}

  /**
   * Synchronizes a metric across all locales.
   * If the metric doesn't exist in other locales, creates a "Ghost Row".
   */
  async sync(aboutId: string, sourceMetric: ImpactMetric): Promise<void> {
    const { internalCode } = sourceMetric;

    for (const locale of this.supportedLocales) {
      if (locale === sourceMetric.locale) continue;

      // Check if metric already exists in this locale using targeted lookup (§XVII)
      const existing = await this.metricRepo.findByParity(
        aboutId,
        locale,
        internalCode,
      );

      if (!existing) {
        // Create Ghost Row using individual create (§VIII)
        await this.metricRepo.create({
          aboutId,
          internalCode,
          locale,
          label: `[${locale.toUpperCase()}] New Impact`,
          value: '0',
          sourceId: sourceMetric.sourceId,
          sourceKey: sourceMetric.sourceKey,
          prefix: sourceMetric.prefix,
          suffix: sourceMetric.suffix,
          iconCode: sourceMetric.iconCode,
        } as Omit<ImpactMetric, 'id'>);
      } else {
        // Sync non-localized metadata using individual update (§VIII)
        await this.metricRepo.update(existing.id, {
          sourceId: sourceMetric.sourceId,
          sourceKey: sourceMetric.sourceKey,
          prefix: sourceMetric.prefix,
          suffix: sourceMetric.suffix,
          iconCode: sourceMetric.iconCode,
        });
      }
    }
  }
}
