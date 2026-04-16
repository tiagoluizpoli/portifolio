import {
  AppwriteCatastrophicConfigError,
  mapAppwriteError,
} from '../errors/appwrite-errors.js';
import type {
  IImpactMetricRepository,
  IMetricSyncService,
  ImpactMetricEntity,
} from '../repositories/interfaces.js';
import { ImpactMetricRepository } from '../repositories/specialized-repositories.js';

function resolveDatabaseId(): string {
  const value = process.env.APPWRITE_DATABASE_ID;

  if (!value) {
    throw new AppwriteCatastrophicConfigError(
      'Missing required APPWRITE_DATABASE_ID',
    );
  }

  return value;
}

function getCounterpartLocale(locale: 'en' | 'pt'): 'en' | 'pt' {
  return locale === 'en' ? 'pt' : 'en';
}

export class MetricSyncService implements IMetricSyncService {
  private readonly metrics: IImpactMetricRepository;

  constructor(metrics?: IImpactMetricRepository) {
    this.metrics = metrics ?? new ImpactMetricRepository(resolveDatabaseId());
  }

  async sync(aboutId: string, source: ImpactMetricEntity): Promise<void> {
    let createdSourceId: string | null = null;

    try {
      const related = await this.metrics.findByAboutAndInternalCode(
        aboutId,
        source.internalCode,
      );

      const sourceLocale = source.locale;
      const targetLocale = getCounterpartLocale(sourceLocale);

      const sourceExists = related.some((metric) => metric.id === source.id);
      if (!sourceExists) {
        const createdSource = await this.metrics.create({
          aboutId,
          internalCode: source.internalCode,
          locale: sourceLocale,
          label: source.label,
          value: source.value,
          sourceId: source.sourceId,
          isPlaceholder: false,
        });

        createdSourceId = createdSource.id;
      }

      const target = related.find((metric) => metric.locale === targetLocale);
      if (target) {
        await this.metrics.update(target.id, {
          sourceId: source.sourceId,
          isPlaceholder: target.isPlaceholder,
        });
        return;
      }

      await this.metrics.create({
        aboutId,
        internalCode: source.internalCode,
        locale: targetLocale,
        label: source.label,
        value: source.value,
        sourceId: source.sourceId,
        isPlaceholder: true,
      });
    } catch (error) {
      if (createdSourceId) {
        try {
          await this.metrics.delete(createdSourceId);
        } catch (rollbackError) {
          throw mapAppwriteError(rollbackError);
        }
      }

      throw mapAppwriteError(error);
    }
  }

  async cleanup(aboutId: string, internalCode: string): Promise<void> {
    try {
      const related = await this.metrics.findByAboutAndInternalCode(
        aboutId,
        internalCode,
      );

      await Promise.all(
        related
          .filter((metric) => metric.isPlaceholder)
          .map((metric) => this.metrics.delete(metric.id)),
      );
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }
}
