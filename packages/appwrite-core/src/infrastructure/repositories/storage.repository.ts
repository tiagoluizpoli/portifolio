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
    };
  }

  /**
   * Generates a preview URL for an image.
   */
  getFilePreview(bucketId: string, fileId: string): URL {
    const storage = AppwriteProvider.getStorage();
    const result = storage.getFilePreview({
      bucketId,
      fileId,
    });

    const previewUrl = result.toString();
    try {
      // If result is already a fully qualified URL, this works
      return new URL(previewUrl);
    } catch {
      // Fallback: Construct absolute URL using the configured endpoint
      // This happens if the Appwrite client was initialized with a relative or empty endpoint
      const env = AppwriteProvider.getEnv();
      const endpoint = env.APPWRITE_ENDPOINT.replace(/\/$/, ''); // Remove trailing slash if present
      const path = previewUrl.startsWith('/') ? previewUrl : `/${previewUrl}`;
      return new URL(`${endpoint}${path}`);
    }
  }

  /**
   * Deletes a file from Appwrite storage.
   */
  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    const storage = AppwriteProvider.getStorage();
    await storage.deleteFile({
      bucketId,
      fileId,
    });
  }
}
