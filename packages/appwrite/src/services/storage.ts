import { ID } from 'node-appwrite';
import { z } from 'zod';
import { getStorageClient } from '../client.js';
import {
  AppwriteCatastrophicConfigError,
  AppwriteSystemException,
  mapAppwriteError,
} from '../errors/appwrite-errors.js';
import { QueryMapper } from '../utils/query-mapper.js';

const uploadPayloadSchema = z.object({
  name: z.string().min(1),
  file: z.unknown(),
  kind: z.enum(['picture', 'pdf']),
  fileId: z.string().min(1).optional(),
});

const downloadPayloadSchema = z.object({
  fileId: z.string().min(1),
  bucketId: z.string().min(1),
});

const findByNamePayloadSchema = z.object({
  fileName: z.string().trim().min(1),
  bucketId: z.string().min(1),
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

export interface StorageAssetRef {
  fileId: string;
  bucketId: string;
}

export interface StorageAssetNameRef {
  fileName: string;
  bucketId: string;
}

function hasArrayBufferMethod(
  value: unknown,
): value is { arrayBuffer: () => Promise<ArrayBuffer> } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { arrayBuffer?: unknown }).arrayBuffer === 'function'
  );
}

function isJsonSerializableObject(
  value: unknown,
): value is Record<string, unknown> | unknown[] {
  if (Array.isArray(value)) {
    return true;
  }

  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
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
  private readonly fileSearchPageSize = 100;

  private async toBuffer(payload: unknown): Promise<Buffer> {
    if (Buffer.isBuffer(payload)) {
      return payload;
    }

    if (payload instanceof Uint8Array) {
      return Buffer.from(payload);
    }

    if (payload instanceof ArrayBuffer) {
      return Buffer.from(new Uint8Array(payload));
    }

    if (ArrayBuffer.isView(payload)) {
      return Buffer.from(
        payload.buffer,
        payload.byteOffset,
        payload.byteLength,
      );
    }

    if (typeof payload === 'string') {
      return Buffer.from(payload);
    }

    if (typeof payload === 'number' || typeof payload === 'boolean') {
      return Buffer.from(String(payload));
    }

    if (hasArrayBufferMethod(payload)) {
      const buffer = await payload.arrayBuffer();
      return Buffer.from(new Uint8Array(buffer));
    }

    if (isJsonSerializableObject(payload)) {
      return Buffer.from(JSON.stringify(payload), 'utf8');
    }

    throw new AppwriteSystemException(
      'Unexpected binary payload returned by storage provider',
    );
  }

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

  async getPreviewUrl(input: StorageAssetRef): Promise<string> {
    const payload = downloadPayloadSchema.parse(input);

    try {
      return this.storage
        .getFilePreview({
          bucketId: payload.bucketId,
          fileId: payload.fileId,
        })
        .toString();
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }

  async getFileInfo(input: StorageAssetRef): Promise<StorageAsset> {
    const payload = downloadPayloadSchema.parse(input);

    try {
      const file = await this.storage.getFile({
        bucketId: payload.bucketId,
        fileId: payload.fileId,
      });
      return {
        id: file.$id,
        bucketId: payload.bucketId,
        name: file.name,
      };
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }

  async resolveFileIdByName(input: StorageAssetNameRef): Promise<string> {
    const payload = findByNamePayloadSchema.parse(input);
    let offset = 0;

    try {
      while (true) {
        const response = await this.storage.listFiles({
          bucketId: payload.bucketId,
          queries: QueryMapper.toAppwriteQueries({
            limit: this.fileSearchPageSize,
            offset,
          }),
        });

        const matches = response.files.filter(
          (file) => file.name === payload.fileName,
        );

        if (matches.length > 1) {
          throw new Error(
            `Multiple files named "${payload.fileName}" found in bucket "${payload.bucketId}". Use unique names.`,
          );
        }

        if (matches.length === 1) {
          return matches[0].$id;
        }

        if (response.files.length < this.fileSearchPageSize) {
          break;
        }

        offset += response.files.length;
      }

      throw new Error(
        `Seed source file "${payload.fileName}" was not found in bucket "${payload.bucketId}".`,
      );
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }

  async download(input: StorageAssetRef): Promise<Buffer> {
    const payload = downloadPayloadSchema.parse(input);

    try {
      const response = await this.storage.getFileDownload({
        bucketId: payload.bucketId,
        fileId: payload.fileId,
      });
      return this.toBuffer(response);
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }
}
