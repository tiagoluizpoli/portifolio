import { type Client, type Models, Query } from 'node-appwrite';
import type {
  ImpactMetric,
  MetricSource,
} from '../../domain/cms/chapters/metrics.js';
import type { IMetricSourceRepository } from '../../domain/repositories/interfaces.js';
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
    const { $id, ...data } = doc;
    return { id: $id, ...data } as unknown as MetricSource;
  }
}

/**
 * MetricRepository
 * Hardened with strict type safety using ImpactMetric.
 */
export class MetricRepository extends AppWriteRepository<ImpactMetric> {
  constructor(client: Client, databaseId: string) {
    super(client, databaseId, 'impact_metrics');
  }

  async getByAboutId(aboutId: string): Promise<ImpactMetric[]> {
    try {
      const response = await this.tables.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [Query.equal('aboutId', aboutId)],
      });
      return response.rows.map((row) =>
        this.mapToModel(row as unknown as Models.Document),
      );
    } catch (error: unknown) {
      this.handleError(error);
      return [];
    }
  }

  async saveByAboutId(aboutId: string, metrics: ImpactMetric[]): Promise<void> {
    try {
      // 1. Get existing metrics for this aboutId
      const existing = await this.getByAboutId(aboutId);
      const existingIds = existing.map((m) => m.id);
      const incomingIds = metrics.filter((m) => m.id).map((m) => m.id);

      // 2. Delete metrics removed from the list
      const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
      for (const id of toDelete) {
        await this.delete(id);
      }

      // 3. Update or create remaining
      for (const metric of metrics) {
        const data = { ...metric, aboutId };
        if (metric.id) {
          await this.update(metric.id, data);
        } else {
          // New metric creation
          const { id: _, ...createData } = data;
          await this.create(createData as Omit<ImpactMetric, 'id'>);
        }
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
