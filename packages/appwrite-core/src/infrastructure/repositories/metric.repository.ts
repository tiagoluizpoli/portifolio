import { type Client, type Models, Query } from 'node-appwrite';
import type {
  ImpactMetric,
  MetricSource,
} from '../../domain/cms/chapters/metrics.js';
import type {
  IMetricRepository,
  IMetricSourceRepository,
} from '../../domain/repositories/interfaces.js';
import { AppWriteRepository } from './appwrite.repository.js';

/**
 * MetricSourceRepository
 * Hardened with strict type safety using MetricSource.
 */
export class MetricSourceRepository
  extends AppWriteRepository<MetricSource>
  implements IMetricSourceRepository
{
  constructor(client: Client, databaseId: string) {
    super(client, databaseId, 'metric_sources');
  }

  async save(sources: MetricSource[]): Promise<void> {
    try {
      for (const source of sources) {
        if (source.id) {
          await this.update(source.id, source);
        } else {
          const { id: _, ...data } = source;
          await this.create(data);
        }
      }
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  protected mapToModel(doc: Models.Document): MetricSource {
    const { $id, name, ...data } = doc as Models.Document & { name?: string };
    const sourceData = data as Record<string, unknown>;
    return {
      id: $id,
      title:
        (name as string) || (sourceData.title as string) || 'Unknown Source',
      ...data,
    } as unknown as MetricSource;
  }
}

/**
 * MetricRepository
 * Hardened with strict type safety using ImpactMetric.
 * Supports Semantic Parity via internalCode.
 */
export class MetricRepository
  extends AppWriteRepository<ImpactMetric>
  implements IMetricRepository
{
  constructor(client: Client, databaseId: string) {
    super(client, databaseId, 'impact_metrics');
  }

  async getByLocale(aboutId: string, locale: string): Promise<ImpactMetric[]> {
    try {
      const response = await this.tables.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [
          Query.equal('aboutId', aboutId),
          Query.equal('locale', locale),
        ],
      });
      return response.rows.map((row) =>
        this.mapToModel(row as unknown as Models.Document),
      );
    } catch (error: unknown) {
      this.handleError(error);
      return [];
    }
  }

  async findByParity(
    aboutId: string,
    locale: string,
    internalCode: string,
  ): Promise<ImpactMetric | null> {
    try {
      const response = await this.tables.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [
          Query.equal('aboutId', aboutId),
          Query.equal('locale', locale),
          Query.equal('internalCode', internalCode),
        ],
      });
      if (response.total === 0) return null;
      return this.mapToModel(response.rows[0] as unknown as Models.Document);
    } catch (error: unknown) {
      this.handleError(error);
      return null;
    }
  }

  async save(
    aboutId: string,
    locale: string,
    metrics: ImpactMetric[],
  ): Promise<void> {
    try {
      // 1. Get existing metrics for this locale
      const existing = await this.getByLocale(aboutId, locale);
      const incomingIds = metrics.filter((m) => m.id).map((m) => m.id);

      // 2. Delete removed
      const toDelete = existing.filter((m) => !incomingIds.includes(m.id));
      for (const item of toDelete) {
        await this.delete(item.id);
      }

      // 3. Upsert
      for (const item of metrics) {
        const data = { ...item, aboutId, locale };
        if (item.id) {
          await this.update(item.id, data);
        } else {
          await this.create(data);
        }
      }
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  async deleteByInternalCode(internalCode: string): Promise<void> {
    try {
      const response = await this.tables.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [Query.equal('internalCode', internalCode)],
      });

      for (const row of response.rows) {
        await this.delete(row.$id);
      }
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  protected mapToModel(doc: Models.Document): ImpactMetric {
    const { $id, ...data } = doc;
    return { id: $id, ...data } as unknown as ImpactMetric;
  }
}
