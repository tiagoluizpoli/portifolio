import type { Asset, Portfolio } from '../domain/repositories/interfaces.js';
import {
  type AppwriteEnv,
  AppwriteProvider,
} from '../infrastructure/appwrite.client.js';
import { PortfolioRepository } from '../infrastructure/repositories/portfolio.repository.js';
import { StorageRepository } from '../infrastructure/repositories/storage.repository.js';
import { withCompensatingTransaction } from './transactions.js';

export class PortfolioService {
  private repository: PortfolioRepository;
  private storageRepository: StorageRepository;

  constructor(projectId: string, collectionId: string) {
    this.repository = new PortfolioRepository(projectId, collectionId);
    this.storageRepository = new StorageRepository();
  }

  /**
   * Fetches a portfolio record by its ID.
   */
  async getPortfolioRecord(documentId: string): Promise<Portfolio | null> {
    return await this.repository.getPortfolioRecord(documentId);
  }

  /**
   * Creates a portfolio item using a compensating transaction.
   * Demonstrated logic for FR-015.
   */
  async createPortfolioItem(data: Omit<Portfolio, 'id'>): Promise<Portfolio> {
    const results = await withCompensatingTransaction<Portfolio>([
      {
        execute: async () => await this.repository.create(data),
        rollback: async (result) => await this.repository.delete(result.id),
      },
      // If there were a second step (e.g. Audit Log), it would go here.
      // If it failed, the first step (Portfolio item) would be deleted automatically.
    ]);
    return results[0];
  }

  /**
   * Global initialization for the AppWrite provider.
   */
  static init(config: AppwriteEnv) {
    AppwriteProvider.initialize(config);
  }

  /**
   * Uploads an asset (image or document) to the Appwrite storage.
   */
  async uploadAsset(
    bucketId: string,
    file: Buffer | Blob,
    fileName: string,
    fileId?: string,
  ): Promise<Asset> {
    return await this.storageRepository.uploadFile(
      bucketId,
      file,
      fileName,
      fileId,
    );
  }

  /**
   * Generates a preview URL for a stored asset.
   */
  getAssetPreview(bucketId: string, fileId: string): URL {
    return this.storageRepository.getFilePreview(bucketId, fileId);
  }

  /**
   * Deletes an asset from storage.
   */
  async deleteAsset(bucketId: string, fileId: string): Promise<void> {
    await this.storageRepository.deleteFile(bucketId, fileId);
  }
}
