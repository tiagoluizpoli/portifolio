import { ID, Query, type TablesDB } from 'node-appwrite';
import { mapAppwriteError } from '../errors/appwrite-errors.js';
import { InternalLogger } from '../utils/logger.js';
import { DocumentMapper } from '../utils/mapper.js';
import type { IRepository, RepositoryEntity } from './interfaces.js';

export abstract class BaseRepository<T extends RepositoryEntity>
  implements IRepository<T>
{
  constructor(
    protected readonly sdk: TablesDB,
    protected readonly databaseId: string,
    protected readonly collectionId: string,
    protected readonly logger: InternalLogger = new InternalLogger(),
  ) {}

  protected parse(entity: Record<string, unknown>): T {
    return entity as T;
  }

  protected async runQuery(queries: string[]): Promise<T[]> {
    const timer = this.logger.start(`${this.collectionId}.runQuery`);
    try {
      const response = await this.sdk.listRows({
        databaseId: this.databaseId,
        tableId: this.collectionId,
        queries,
      });

      const mapped = response.rows.map((document) =>
        this.parse(DocumentMapper.toDomain<Record<string, unknown>>(document)),
      );

      this.logger.finish(timer, 'success');
      return mapped;
    } catch (error) {
      this.logger.finish(timer, 'error');
      throw mapAppwriteError(error);
    }
  }

  async findById(id: string): Promise<T | null> {
    const timer = this.logger.start(`${this.collectionId}.findById`);
    try {
      const raw = await this.sdk.getRow({
        databaseId: this.databaseId,
        tableId: this.collectionId,
        rowId: id,
      });
      this.logger.finish(timer, 'success');

      return this.parse(DocumentMapper.toDomain<Record<string, unknown>>(raw));
    } catch (error) {
      const exception = error as { code?: unknown };

      if (exception.code === 404) {
        this.logger.finish(timer, 'success');
        return null;
      }

      this.logger.finish(timer, 'error');
      throw mapAppwriteError(error);
    }
  }

  async findAll(): Promise<T[]> {
    return this.runQuery([Query.limit(1000)]);
  }

  async create(data: Record<string, unknown>): Promise<T> {
    const timer = this.logger.start(`${this.collectionId}.create`);
    try {
      const raw = await this.sdk.createRow({
        databaseId: this.databaseId,
        tableId: this.collectionId,
        rowId: ID.unique(),
        data: DocumentMapper.toAppwrite(data),
      });

      this.logger.finish(timer, 'success');
      return this.parse(DocumentMapper.toDomain<Record<string, unknown>>(raw));
    } catch (error) {
      this.logger.finish(timer, 'error');
      throw mapAppwriteError(error);
    }
  }

  async update(id: string, data: Record<string, unknown>): Promise<T> {
    const timer = this.logger.start(`${this.collectionId}.update`);
    try {
      const raw = await this.sdk.updateRow({
        databaseId: this.databaseId,
        tableId: this.collectionId,
        rowId: id,
        data: DocumentMapper.toAppwrite(data),
      });

      this.logger.finish(timer, 'success');
      return this.parse(DocumentMapper.toDomain<Record<string, unknown>>(raw));
    } catch (error) {
      this.logger.finish(timer, 'error');
      throw mapAppwriteError(error);
    }
  }

  async delete(id: string): Promise<void> {
    const timer = this.logger.start(`${this.collectionId}.delete`);
    try {
      await this.sdk.deleteRow({
        databaseId: this.databaseId,
        tableId: this.collectionId,
        rowId: id,
      });
      this.logger.finish(timer, 'success');
    } catch (error) {
      this.logger.finish(timer, 'error');
      throw mapAppwriteError(error);
    }
  }
}
