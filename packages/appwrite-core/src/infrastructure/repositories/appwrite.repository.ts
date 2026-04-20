import { type Client, ID, type Models, TablesDB } from 'node-appwrite';
import { asTableId, type TableId } from '../../domain/repositories/ids.js';
import type { IRepository } from '../../domain/repositories/interfaces.js';
import { ExceptionMapper } from '../../domain/services/exception-mapper.js';

/**
 * AppWriteRepository
 * Base class for all Appwrite-backed repositories.
 * Hardened with strict type safety to satisfy the IRepository interface.
 */
export abstract class AppWriteRepository<T extends { id: string }>
  implements IRepository<T>
{
  protected tables: TablesDB;

  constructor(
    client: Client,
    protected databaseId: string,
    tableId: TableId | string,
  ) {
    if (!client) throw new Error('AppWrite client is required');
    this.tables = new TablesDB(client);
    this.tableId = asTableId(tableId);
  }

  protected tableId: TableId;

  async findById(id: string): Promise<T | null> {
    try {
      const row = await this.tables.getRow({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId: id,
      });
      return this.mapToModel(row as unknown as Models.Document);
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 404) return null;
      this.handleError(err);
    }
  }

  async findAll(): Promise<T[]> {
    try {
      const response = await this.tables.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
      });
      return response.rows.map((row) =>
        this.mapToModel(row as unknown as Models.Document),
      );
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    try {
      const row = await this.tables.createRow({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId: ID.unique(),
        data: this.prepareData(data) as unknown as Record<string, unknown>,
      });
      return this.mapToModel(row as unknown as Models.Document);
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const row = await this.tables.updateRow({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId: id,
        data: this.prepareData(data) as unknown as Record<string, unknown>,
      });
      return this.mapToModel(row as unknown as Models.Document);
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level generic handling
  protected prepareData(data: any): any {
    const {
      id,
      $id,
      $databaseId,
      $collectionId,
      $createdAt,
      $updatedAt,
      $permissions,
      ...cleanData
    } = data;
    return cleanData;
  }

  async delete(id: string): Promise<void> {
    try {
      await this.tables.deleteRow({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId: id,
      });
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  protected abstract mapToModel(doc: Models.Document): T;

  protected handleError(error: unknown): never {
    ExceptionMapper.map(error);
  }
}
