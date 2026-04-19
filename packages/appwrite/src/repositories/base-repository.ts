import { ID, type TablesDB } from 'node-appwrite';
import {
  InvalidRepositoryQueryError,
  mapAppwriteError,
} from '../errors/appwrite-errors.js';
import { InternalLogger } from '../utils/logger.js';
import { DocumentMapper } from '../utils/mapper.js';
import { QueryMapper } from '../utils/query-mapper.js';
import {
  type IRepository,
  type RepositoryCreateInput,
  type RepositoryDeleteInput,
  type RepositoryEntity,
  type RepositoryFindByIdInput,
  type RepositoryQueryOptions,
  type RepositoryUpdateInput,
  repositoryQueryOptionsSchema,
} from './interfaces.js';

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

  async findById(input: RepositoryFindByIdInput): Promise<T | null> {
    const { id } = input;
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

  async findMany(options?: RepositoryQueryOptions): Promise<T[]> {
    const timer = this.logger.start(`${this.collectionId}.findMany`);
    try {
      const validated = repositoryQueryOptionsSchema.safeParse(options ?? {});

      if (!validated.success) {
        throw new InvalidRepositoryQueryError(
          `Invalid query options: ${validated.error.issues.map((e) => e.message).join(', ')}`,
        );
      }

      const queries = QueryMapper.toAppwriteQueries(validated.data);
      const result = await this.runQuery(queries);
      this.logger.finish(timer, 'success');
      return result;
    } catch (error) {
      this.logger.finish(timer, 'error');
      throw error;
    }
  }

  async findAll(): Promise<T[]> {
    return this.runQuery(QueryMapper.toAppwriteQueries({ limit: 1000 }));
  }

  async create(input: RepositoryCreateInput): Promise<T> {
    const { data } = input;
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

  async update(input: RepositoryUpdateInput): Promise<T> {
    const { id, data } = input;
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

  async delete(input: RepositoryDeleteInput): Promise<void> {
    const { id } = input;
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
