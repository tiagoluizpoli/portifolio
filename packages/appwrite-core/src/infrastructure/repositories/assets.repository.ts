import { type Client, ID, type Models, Query } from 'node-appwrite';
import type { Skill, Solution } from '../../domain/cms/chapters/assets.js';
import type {
  ISkillRepository,
  ISolutionRepository,
} from '../../domain/repositories/interfaces.js';
import { AppWriteRepository } from './appwrite.repository.js';
import { StorageRepository } from './storage.repository.js';

export class SkillRepository
  extends AppWriteRepository<Skill>
  implements ISkillRepository
{
  constructor(client: Client, databaseId: string) {
    super(client, databaseId, 'skills');
  }

  async getByLocale(locale: string): Promise<Skill[]> {
    try {
      const response = await this.tables.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [Query.equal('locale', locale)],
      });
      return response.rows.map((row) =>
        this.mapToModel(row as unknown as Models.Document),
      );
    } catch (error: unknown) {
      this.handleError(error);
      return [];
    }
  }

  async save(locale: string, items: Skill[]): Promise<void> {
    try {
      // 1. Get existing skills
      const existing = await this.getByLocale(locale);
      const incomingIds = items.filter((s) => s.id).map((s) => s.id);

      // 2. Delete removed
      const toDelete = existing.filter((s) => !incomingIds.includes(s.id));
      const storage = new StorageRepository();

      for (const item of toDelete) {
        if (item.iconId) {
          await storage.moveFile('assets', 'trash', item.iconId);
        }
        await this.delete(item.id);
      }

      // 3. Upsert
      for (const item of items) {
        if (item.id) {
          const old = existing.find((s) => s.id === item.id);
          if (old?.iconId && old.iconId !== item.iconId) {
            await storage.moveFile('assets', 'trash', old.iconId);
          }
          await this.update(item.id, { ...item, locale });
        } else {
          await this.tables.createRow({
            databaseId: this.databaseId,
            tableId: this.tableId,
            rowId: ID.unique(),
            data: this.prepareData({
              ...item,
              locale,
            }) as unknown as Record<string, unknown>,
          });
        }
      }
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  protected mapToModel(doc: Models.Document): Skill {
    const { $id, ...data } = doc;
    return { id: $id, ...data } as unknown as Skill;
  }
}

export class SolutionRepository
  extends AppWriteRepository<Solution>
  implements ISolutionRepository
{
  constructor(client: Client, databaseId: string) {
    super(client, databaseId, 'solutions');
  }

  async getByLocale(locale: string): Promise<Solution[]> {
    try {
      const response = await this.tables.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [Query.equal('locale', locale)],
      });
      return response.rows.map((row) =>
        this.mapToModel(row as unknown as Models.Document),
      );
    } catch (error: unknown) {
      this.handleError(error);
      return [];
    }
  }

  async save(locale: string, items: Solution[]): Promise<void> {
    try {
      // 1. Get existing
      const existing = await this.getByLocale(locale);
      const incomingIds = items.filter((s) => s.id).map((s) => s.id);

      // 2. Delete removed
      const toDelete = existing.filter((s) => !incomingIds.includes(s.id));
      const storage = new StorageRepository();

      for (const item of toDelete) {
        if (item.iconId) {
          await storage.moveFile('assets', 'trash', item.iconId);
        }
        await this.delete(item.id);
      }

      // 3. Upsert
      for (const item of items) {
        if (item.id) {
          const old = existing.find((s) => s.id === item.id);
          if (old?.iconId && old.iconId !== item.iconId) {
            await storage.moveFile('assets', 'trash', old.iconId);
          }
          await this.update(item.id, { ...item, locale });
        } else {
          await this.tables.createRow({
            databaseId: this.databaseId,
            tableId: this.tableId,
            rowId: ID.unique(),
            data: this.prepareData({
              ...item,
              locale,
            }) as unknown as Record<string, unknown>,
          });
        }
      }
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  protected mapToModel(doc: Models.Document): Solution {
    const { $id, ...data } = doc;
    return { id: $id, ...data } as unknown as Solution;
  }
}
