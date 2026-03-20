import { AppwriteProvider } from '@repo/appwrite-core';
import { type Models, Permission, Role, type Storage } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';

export class StorageManager {
  private storage: Storage;

  constructor() {
    this.storage = AppwriteProvider.getStorage();
  }

  async run() {
    console.log('[DEBUG] StorageManager: Maintenance Run initiated.');
  }

  async cleanupOrphans(usedFileIds: Set<string>) {
    console.log('[STEP] Storage Lifecycle: Cleaning up orphaned assets...');

    try {
      const files = await this.storage.listFiles({ bucketId: 'assets' });

      for (const file of files.files) {
        if (!usedFileIds.has(file.$id)) {
          console.log(
            `[ORPHAN] Asset ${file.$id} ("${file.name}") identified. Moving to trash...`,
          );

          const fileBuffer = await this.storage.getFileDownload({
            bucketId: 'assets',
            fileId: file.$id,
          });

          await this.storage.createFile({
            bucketId: 'trash',
            fileId: file.$id,
            file: InputFile.fromBuffer(Buffer.from(fileBuffer), file.name),
            permissions: [
              Permission.read(AppwriteProvider.getCuratorRole()),
              Permission.write(AppwriteProvider.getCuratorRole()),
            ],
          });

          await this.storage.deleteFile({
            bucketId: 'assets',
            fileId: file.$id,
          });
          console.log(`[CLEANUP] Asset ${file.$id} moved to trash.`);
        }
      }
    } catch (error) {
      console.error('[ERROR] Storage Cleanup failed:', error);
    }
  }

  async uploadAsset(
    bucketId: string,
    fileId: string,
    name: string,
    buffer: Buffer,
  ): Promise<Models.File> {
    try {
      return await this.storage.createFile({
        bucketId,
        fileId,
        file: InputFile.fromBuffer(buffer, name),
        permissions: [
          Permission.read(Role.any()),
          Permission.write(AppwriteProvider.getCuratorRole()),
        ],
      });
    } catch (error) {
      console.error(`[ERROR] Failed to upload asset ${fileId}:`, error);
      throw error;
    }
  }
}
