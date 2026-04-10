import { type Client, type Models, Query } from 'node-appwrite';
import type { AboutData } from '../../domain/cms/chapters/about.js';
import type { ImpactMetric } from '../../domain/cms/chapters/metrics.js';
import type { IAboutRepository } from '../../domain/repositories/interfaces.js';
import { AppWriteRepository } from './appwrite.repository.js';

/**
 * AboutRepository
 * Hardened with strict type safety using AboutData.
 */
export class AboutRepository
  extends AppWriteRepository<AboutData>
  implements IAboutRepository
{
  constructor(client: Client, databaseId: string) {
    super(client, databaseId, 'about');
  }

  async getByLocale(locale: string): Promise<AboutData | null> {
    try {
      const response = await this.tables.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [Query.equal('locale', locale)],
      });

      if (response.total === 0) return null;
      return this.mapToModel(response.rows[0] as unknown as Models.Document);
    } catch (error: unknown) {
      this.handleError(error);
      return null;
    }
  }

  async updateByLocale(
    locale: string,
    data: Omit<AboutData, 'id'>,
  ): Promise<AboutData> {
    try {
      const existing = await this.getByLocale(locale);

      if (existing) {
        return this.update(existing.id, data);
      }

      const row = await this.tables.createRow({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId: `about-${locale}`,
        data: { ...data, locale } as unknown as Record<string, unknown>,
      });
      return this.mapToModel(row as unknown as Models.Document);
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  async getMetrics(_aboutId: string): Promise<ImpactMetric[]> {
    // Orquestrated by service
    return [];
  }

  async saveMetrics(_aboutId: string, _metrics: ImpactMetric[]): Promise<void> {
    // Orquestrated by service
  }

  protected mapToModel(doc: Models.Document): AboutData {
    const { $id, ...data } = doc;
    return { id: $id, ...data } as unknown as AboutData;
  }
}
