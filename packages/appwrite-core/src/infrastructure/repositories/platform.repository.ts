import { type Client, ID, type Models } from 'node-appwrite';
import type { Platform } from '../../domain/cms/chapters/platforms.js';
import type { IPlatformRepository } from '../../domain/repositories/interfaces.js';
import { AppWriteRepository } from './appwrite.repository.js';

export class PlatformRepository
  extends AppWriteRepository<Platform>
  implements IPlatformRepository
{
  constructor(client: Client, databaseId: string) {
    super(client, databaseId, 'platforms');
  }

  async save(items: Platform[]): Promise<void> {
    try {
      // 1. Get existing
      const existing = await this.findAll();
      const incomingIds = items.filter((p) => p.id).map((p) => p.id);

      // 2. Delete removed
      const toDelete = existing.filter((p) => !incomingIds.includes(p.id));
      for (const item of toDelete) {
        await this.delete(item.id);
      }

      // 3. Upsert
      for (const item of items) {
        if (item.id) {
          await this.update(item.id, item);
        } else {
          await this.tables.createRow({
            databaseId: this.databaseId,
            tableId: this.tableId,
            rowId: ID.unique(),
            data: this.prepareData(item) as unknown as Record<string, unknown>,
          });
        }
      }
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  protected mapToModel(doc: Models.Document): Platform {
    const { $id, ...data } = doc;
    return { id: $id, ...data } as unknown as Platform;
  }
}
