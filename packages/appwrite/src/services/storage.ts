import { ID } from 'node-appwrite';
import { z } from 'zod';
import { getStorageClient } from '../client.js';
import {
  AppwriteCatastrophicConfigError,
  mapAppwriteError,
} from '../errors/appwrite-errors.js';

const uploadPayloadSchema = z.object({
  name: z.string().min(1),
  file: z.unknown(),
  kind: z.enum(['picture', 'pdf']),
  fileId: z.string().min(1).optional(),
});

export interface UploadPayload {
  name: string;
  file: unknown;
  kind: 'picture' | 'pdf';
  fileId?: string;
}

export interface StorageAsset {
  id: string;
  bucketId: string;
  name: string;
}

function resolveBucket(kind: 'picture' | 'pdf'): string {
  const value =
    kind === 'picture'
      ? process.env.APPWRITE_BUCKET_PICTURES_ID
      : process.env.APPWRITE_BUCKET_PDFS_ID;

  if (!value) {
    throw new AppwriteCatastrophicConfigError(
      `Missing required bucket id for ${kind}`,
    );
  }

  return value;
}

export class StorageService {
  private readonly storage = getStorageClient();

  async upload(input: UploadPayload): Promise<StorageAsset> {
    const payload = uploadPayloadSchema.parse(input);
    const bucketId = resolveBucket(payload.kind);

    try {
      const file = await this.storage.createFile({
        bucketId,
        fileId: payload.fileId ?? ID.unique(),
        file: payload.file as never,
      });

      return {
        id: file.$id,
        bucketId,
        name: payload.name,
      };
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }

  async getPreviewUrl(fileId: string, bucketId: string): Promise<string> {
    try {
      return this.storage.getFilePreview({ bucketId, fileId }).toString();
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }

  async getFileInfo(fileId: string, bucketId: string): Promise<StorageAsset> {
    try {
      const file = await this.storage.getFile({ bucketId, fileId });
      return {
        id: file.$id,
        bucketId,
        name: file.name,
      };
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }
}
