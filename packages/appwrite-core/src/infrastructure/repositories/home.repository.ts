import { type Client, type Models, Query } from 'node-appwrite';
import type { HomeData } from '../../domain/cms/chapters/home.js';
import type { IHomeRepository } from '../../domain/repositories/interfaces.js';
import { AppWriteRepository } from './appwrite.repository.js';

/**
 * HomeRepository
 * Hardened with strict type safety using HomeData.
 */
export class HomeRepository
  extends AppWriteRepository<HomeData>
  implements IHomeRepository
{
  constructor(client: Client, databaseId: string) {
    super(client, databaseId, 'home');
  }

  async getByLocale(locale: string): Promise<HomeData | null> {
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
    data: Omit<HomeData, 'id'>,
  ): Promise<HomeData> {
    try {
      const existing = await this.getByLocale(locale);
      let result: HomeData;

      if (existing) {
        result = await this.update(existing.id, data);
      } else {
        // Create if doesn't exist (singleton per locale)
        const row = await this.tables.createRow({
          databaseId: this.databaseId,
          tableId: this.tableId,
          rowId: `home-${locale}`,
          data: { ...data, locale } as unknown as Record<string, unknown>,
        });
        result = this.mapToModel(row as unknown as Models.Document);
      }

      // Sync global fields across all other locales
      await this.syncGlobalFields(locale, data);

      return result;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  private async syncGlobalFields(
    currentLocale: string,
    data: Omit<HomeData, 'id'>,
  ) {
    const globalFields: (keyof Omit<HomeData, 'id'>)[] = [
      'firstName',
      'lastName',
      'pictureId',
      'cvId',
      'journeyStartedIn',
    ];

    const response = await this.tables.listRows({
      databaseId: this.databaseId,
      tableId: this.tableId,
    });

    const otherLocales = response.rows.filter(
      // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
      (row) => (row as any).locale !== currentLocale,
    );

    const updates = otherLocales.map((row) => {
      // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
      const payload: any = {};
      for (const field of globalFields) {
        if (data[field] !== undefined) {
          payload[field] = data[field];
        }
      }
      // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
      return this.update((row as any).$id, payload);
    });

    await Promise.all(updates);
  }

  protected mapToModel(doc: Models.Document): HomeData {
    const {
      $id,
      $databaseId,
      $collectionId,
      $createdAt,
      $updatedAt,
      $permissions,
      ...data
    } = doc;
    return {
      id: $id,
      ...(data as unknown as Omit<HomeData, 'id'>),
    } as HomeData;
  }
}
