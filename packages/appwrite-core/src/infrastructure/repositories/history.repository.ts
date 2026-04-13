import { type Client, ID, type Models, Query } from 'node-appwrite';
import type { HistoryItem } from '../../domain/cms/chapters/history.js';
import type { IHistoryRepository } from '../../domain/repositories/interfaces.js';
import { AppWriteRepository } from './appwrite.repository.js';

/**
 * HistoryRepository (Constitution §XVII, §I)
 * Orchestrates technical history records across 'experience' and 'education' tables.
 */
export class HistoryRepository
  extends AppWriteRepository<HistoryItem>
  implements IHistoryRepository
{
  constructor(client: Client, databaseId: string) {
    // Dynamic table selection based on type
    super(client, databaseId, 'history');
  }

  async getByLocale(
    type: 'experience' | 'education',
    locale: string,
  ): Promise<HistoryItem[]> {
    try {
      const response = await this.tables.listRows({
        databaseId: this.databaseId,
        tableId: type, // Directly target experience or education table
        queries: [Query.equal('locale', locale)],
      });
      return response.rows.map((row) =>
        this.mapHistoryToModel(row as unknown as Models.Document, type),
      );
    } catch (error: unknown) {
      this.handleError(error);
      return [];
    }
  }

  async save(
    type: 'experience' | 'education',
    locale: string,
    items: HistoryItem[],
  ): Promise<void> {
    try {
      // 1. Get existing records for this type and locale
      const existing = await this.getByLocale(type, locale);
      const existingIds = existing.map((h) => h.id);
      const incomingIds = items.filter((h) => h.id).map((h) => h.id);

      // 2. Delete removed
      const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
      for (const id of toDelete) {
        await this.tables.deleteRow({
          databaseId: this.databaseId,
          tableId: type,
          rowId: id,
        });
      }

      // 3. Upsert
      for (const item of items) {
        const payload = this.prepareHistoryData(item);
        const data = { ...payload, locale } as unknown as Record<
          string,
          unknown
        >;

        if (item.id) {
          await this.tables.updateRow({
            databaseId: this.databaseId,
            tableId: type,
            rowId: item.id,
            data,
          });
        } else {
          await this.tables.createRow({
            databaseId: this.databaseId,
            tableId: type,
            rowId: ID.unique(),
            data,
          });
        }
      }
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  /**
   * Maps domain-level HistoryItem fields to table-specific schema (§XVII).
   */
  private prepareHistoryData(item: HistoryItem): Record<string, unknown> {
    const { id, type, organization, title, period, ...rest } = item;

    if (type === 'experience') {
      return {
        ...rest,
        company: organization,
        position: title,
        duration: period,
      };
    }

    return {
      ...rest,
      institution: organization,
      degree: title,
      duration: period,
    };
  }

  /**
   * Restores domain-level HistoryItem fields from technical DB records (§XVII).
   */
  private mapHistoryToModel(
    doc: Models.Document,
    type: 'experience' | 'education',
  ): HistoryItem {
    const historicalDoc = doc as unknown as Models.Document & {
      company?: string;
      position?: string;
      institution?: string;
      degree?: string;
      duration: string;
    };

    const { $id, company, position, institution, degree, duration, ...data } =
      historicalDoc;

    return {
      id: $id,
      type,
      organization: type === 'experience' ? company : institution,
      title: type === 'experience' ? position : degree,
      period: duration,
      ...data,
    } as unknown as HistoryItem;
  }

  protected mapToModel(doc: Models.Document): HistoryItem {
    // This method is required by base class but not used directly in HistoryRepository
    // because we have two tables (Experience/Education) with different schemas.
    // Use mapHistoryToModel instead.
    const { $id, ...data } = doc;
    return { id: $id, ...data } as unknown as HistoryItem;
  }
}
