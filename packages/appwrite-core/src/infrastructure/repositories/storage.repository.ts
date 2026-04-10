import { ID } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import type {
  Asset,
  IStorageRepository,
} from '../../domain/repositories/interfaces.js';
import { AppwriteProvider } from '../appwrite.client.js';

export class StorageRepository implements IStorageRepository {
  /**
   * Uploads a file to a specific Appwrite bucket.
   */
  async uploadFile(
    bucketId: string,
    file: Buffer | Blob,
    fileName: string,
    fileId?: string,
  ): Promise<Asset> {
    const storage = AppwriteProvider.getStorage();

    // Prepare the file for Appwrite
    const inputFile = InputFile.fromBuffer(file as Buffer, fileName);

    // Latest Appwrite SDK (v14.1.0+) uses a single object parameter for createFile
    const result = await storage.createFile({
      bucketId,
      fileId: fileId || ID.unique(),
      file: inputFile,
    });

    return {
      id: result.$id,
      bucketId: result.bucketId,
      name: result.name,
      mimeType: result.mimeType,
      size: result.sizeOriginal,
      createdAt: result.$createdAt,
    };
  }

  /**
   * Generates a preview URL for an image.
   * Using Manual URL construction for efficiency and resilience (Constitution §XVII).
   */
  async getFilePreview(bucketId: string, fileId: string): Promise<URL> {
    const env = AppwriteProvider.getEnv();
    const endpoint = (
      env.APPWRITE_ENDPOINT_PUBLIC || env.APPWRITE_ENDPOINT
    ).replace(/\/$/, '');
    const projectId = env.APPWRITE_PROJECT_ID;

    // Manual Appwrite Preview URL Pattern:
    // [endpoint]/storage/buckets/[bucketId]/files/[fileId]/preview?project=[projectId]
    const previewPath = `/storage/buckets/${bucketId}/files/${fileId}/preview?project=${projectId}`;
    return new URL(`${endpoint}${previewPath}`);
  }

  /**
   * Generates a high-fidelity view URL for an asset (e.g. for PDF visualization).
   */
  async getFileView(bucketId: string, fileId: string): Promise<URL> {
    const env = AppwriteProvider.getEnv();
    const endpoint = (
      env.APPWRITE_ENDPOINT_PUBLIC || env.APPWRITE_ENDPOINT
    ).replace(/\/$/, '');
    const projectId = env.APPWRITE_PROJECT_ID;

    // Manual Appwrite View URL Pattern (Constitution §XVII):
    // [endpoint]/storage/buckets/[bucketId]/files/[fileId]/view?project=[projectId]
    const viewPath = `/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
    return new URL(`${endpoint}${viewPath}`);
  }

  /**
   * Fetches the metadata for a single file.
   */
  async getFile(bucketId: string, fileId: string): Promise<Asset> {
    const storage = AppwriteProvider.getStorage();
    const result = await storage.getFile(bucketId, fileId);
    return {
      id: result.$id,
      bucketId: result.bucketId,
      name: result.name,
      mimeType: result.mimeType,
      size: result.sizeOriginal,
      createdAt: result.$createdAt,
    };
  }

  /**
   * Deletes a file from Appwrite storage.
   */
  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    try {
      const storage = AppwriteProvider.getStorage();
      await storage.deleteFile({
        bucketId,
        fileId,
      });
    } catch (error: unknown) {
      // Silently fail if file is already gone to ensure idempotency
      const err = error as { code?: number };
      if (err.code === 404) return;
      throw error;
    }
  }

  /**
   * Downloads a file from Appwrite storage.
   */
  async downloadFile(bucketId: string, fileId: string): Promise<Response> {
    try {
      const storage = AppwriteProvider.getStorage();
      const result = await storage.getFileDownload({
        bucketId,
        fileId,
      });
      // Convert Buffer to Response for compatibility with the interface
      return new Response(result);
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 404) {
        throw new Error(`Storage file ${fileId} not found`);
      }
      throw error;
    }
  }

  /**
   * Migrates a file from one bucket to another (e.g., to Trash).
   */
  async moveFile(
    sourceBucketId: string,
    destBucketId: string,
    fileId: string,
  ): Promise<void> {
    try {
      const storage = AppwriteProvider.getStorage();

      // 1. Get metadata (needed for original filename)
      const asset = await this.getFile(sourceBucketId, fileId);

      // 2. Download content
      const arrayBuffer = await storage.getFileDownload({
        bucketId: sourceBucketId,
        fileId,
      });

      // 3. Upload to destination with same ID
      const buffer = Buffer.from(arrayBuffer);
      const inputFile = InputFile.fromBuffer(buffer, asset.name);
      await storage.createFile({
        bucketId: destBucketId,
        fileId,
        file: inputFile,
      });

      // 4. Delete from source
      await this.deleteFile(sourceBucketId, fileId);
    } catch (error: unknown) {
      const err = error as { code?: number };
      // If source file is missing, we consider it "moved" (idempotency)
      if (err.code === 404) return;
      throw error;
    }
  }
}
