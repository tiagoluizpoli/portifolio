import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AppwriteCatastrophicConfigError,
  AppwriteSystemException,
} from '../errors/appwrite-errors';

let storageMock = {
  createFile: vi.fn(),
  getFilePreview: vi.fn(),
  getFile: vi.fn(),
};

vi.mock('../client', () => ({
  getStorageClient: () => storageMock,
}));

import { StorageService } from './storage';

describe('StorageService', () => {
  beforeEach(() => {
    storageMock = {
      createFile: vi.fn(),
      getFilePreview: vi.fn(),
      getFile: vi.fn(),
    };

    process.env.APPWRITE_BUCKET_PICTURES_ID = 'bucket-pictures';
    process.env.APPWRITE_BUCKET_PDFS_ID = 'bucket-pdfs';
  });

  it('uploads picture to configured bucket', async () => {
    storageMock.createFile.mockResolvedValue({ $id: 'f1' });
    const service = new StorageService();

    await expect(
      service.upload({
        name: 'avatar',
        file: Buffer.from('a'),
        kind: 'picture',
      }),
    ).resolves.toEqual({
      id: 'f1',
      bucketId: 'bucket-pictures',
      name: 'avatar',
    });
  });

  it('uploads pdf to configured bucket', async () => {
    storageMock.createFile.mockResolvedValue({ $id: 'f2' });
    const service = new StorageService();

    await expect(
      service.upload({ name: 'resume', file: Buffer.from('b'), kind: 'pdf' }),
    ).resolves.toEqual({ id: 'f2', bucketId: 'bucket-pdfs', name: 'resume' });
  });

  it('throws catastrophic error if bucket env is missing', async () => {
    delete process.env.APPWRITE_BUCKET_PICTURES_ID;
    const service = new StorageService();

    await expect(
      service.upload({
        name: 'avatar',
        file: Buffer.from('a'),
        kind: 'picture',
      }),
    ).rejects.toBeInstanceOf(AppwriteCatastrophicConfigError);
  });

  it('maps upload failures to system exception', async () => {
    storageMock.createFile.mockRejectedValue({ code: 500 });
    const service = new StorageService();

    await expect(
      service.upload({
        name: 'avatar',
        file: Buffer.from('a'),
        kind: 'picture',
      }),
    ).rejects.toBeInstanceOf(AppwriteSystemException);
  });

  it('returns preview url and maps errors', async () => {
    storageMock.getFilePreview.mockReturnValue(new URL('https://preview'));
    const service = new StorageService();

    await expect(service.getPreviewUrl('f1', 'bucket-pictures')).resolves.toBe(
      'https://preview/',
    );

    storageMock.getFilePreview.mockImplementation(() => {
      throw { code: 500 };
    });

    await expect(
      service.getPreviewUrl('f1', 'bucket-pictures'),
    ).rejects.toBeInstanceOf(AppwriteSystemException);
  });

  it('returns file info and maps errors', async () => {
    storageMock.getFile.mockResolvedValue({ $id: 'f1', name: 'resume.pdf' });
    const service = new StorageService();

    await expect(service.getFileInfo('f1', 'bucket-pdfs')).resolves.toEqual({
      id: 'f1',
      bucketId: 'bucket-pdfs',
      name: 'resume.pdf',
    });

    storageMock.getFile.mockRejectedValue({ code: 500 });
    await expect(
      service.getFileInfo('f1', 'bucket-pdfs'),
    ).rejects.toBeInstanceOf(AppwriteSystemException);
  });
});
