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
   * Implements "Serial with Rollback" safety for parity integrity.
   */
  async sync(aboutId: string, sourceMetric: ImpactMetric): Promise<void> {
    const { internalCode } = sourceMetric;
    const createdIds: string[] = [];

    try {
      for (const locale of this.supportedLocales) {
        if (locale === sourceMetric.locale) continue;

        // Check if metric already exists using targeted lookup (§XVII)
        const existing = await this.metricRepo.findByParity(
          aboutId,
          locale,
          internalCode,
        );

        if (!existing) {
          // Create Ghost Row with Draft signaling (§VIII)
          const ghostRow = await this.metricRepo.create({
            aboutId,
            internalCode,
            locale,
            label: `[${locale.toUpperCase()}] New Metric (Draft)`,
            value: sourceMetric.value || '0',
            sourceId: sourceMetric.sourceId,
            prefix: sourceMetric.prefix,
            suffix: sourceMetric.suffix,
            iconCode: sourceMetric.iconCode,
            isPlaceholder: true,
          } as Omit<ImpactMetric, 'id'>);
          createdIds.push(ghostRow.id);
        } else {
          // Metadata Mirroring: Propagate non-localized semantic tokens (§XVII)
          await this.metricRepo.update(existing.id, {
            sourceId: sourceMetric.sourceId,
            prefix: sourceMetric.prefix,
            suffix: sourceMetric.suffix,
            iconCode: sourceMetric.iconCode,
            // Sync placeholder status ONLY if the source is no longer a placeholder
            isPlaceholder: sourceMetric.isPlaceholder && existing.isPlaceholder,
          });
        }
      }
    } catch (error: unknown) {
      // Automatic Rollback: Purge created rows on partial failure (§VIII)
      for (const id of createdIds) {
        try {
          await this.metricRepo.delete(id);
        } catch {
          /* Swallowing rollback failures to focus on primary error */
        }
      }
      throw error;
    }
  }
}
