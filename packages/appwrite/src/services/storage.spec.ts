import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AppwriteCatastrophicConfigError,
  AppwriteSystemException,
} from '../errors/appwrite-errors';

let storageMock = {
  createFile: vi.fn(),
  getFilePreview: vi.fn(),
  getFile: vi.fn(),
  getFileDownload: vi.fn(),
  listFiles: vi.fn(),
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
      getFileDownload: vi.fn(),
      listFiles: vi.fn(),
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

  it('throws catastrophic error if pdf bucket env is missing', async () => {
    delete process.env.APPWRITE_BUCKET_PDFS_ID;
    const service = new StorageService();

    await expect(
      service.upload({
        name: 'resume',
        file: Buffer.from('b'),
        kind: 'pdf',
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

    await expect(
      service.getPreviewUrl({ fileId: 'f1', bucketId: 'bucket-pictures' }),
    ).resolves.toBe('https://preview/');

    storageMock.getFilePreview.mockImplementation(() => {
      throw { code: 500 };
    });

    await expect(
      service.getPreviewUrl({ fileId: 'f1', bucketId: 'bucket-pictures' }),
    ).rejects.toBeInstanceOf(AppwriteSystemException);
  });

  it('returns file info and maps errors', async () => {
    storageMock.getFile.mockResolvedValue({ $id: 'f1', name: 'resume.pdf' });
    const service = new StorageService();

    await expect(
      service.getFileInfo({ fileId: 'f1', bucketId: 'bucket-pdfs' }),
    ).resolves.toEqual({
      id: 'f1',
      bucketId: 'bucket-pdfs',
      name: 'resume.pdf',
    });

    storageMock.getFile.mockRejectedValue({ code: 500 });
    await expect(
      service.getFileInfo({ fileId: 'f1', bucketId: 'bucket-pdfs' }),
    ).rejects.toBeInstanceOf(AppwriteSystemException);
  });

  it('downloads binary payloads as Buffer', async () => {
    const service = new StorageService();
    storageMock.getFileDownload.mockResolvedValue(new Uint8Array([1, 2, 3]));

    await expect(
      service.download({ fileId: 'f1', bucketId: 'bucket-pdfs' }),
    ).resolves.toEqual(Buffer.from([1, 2, 3]));
  });

  it('resolves file id by file name in bucket', async () => {
    const service = new StorageService();
    storageMock.listFiles.mockResolvedValue({
      total: 2,
      files: [
        { $id: 'first', name: 'other.json' },
        { $id: 'target', name: 'seed-data.json' },
      ],
    });

    await expect(
      service.resolveFileIdByName({
        bucketId: 'bucket-pdfs',
        fileName: 'seed-data.json',
      }),
    ).resolves.toBe('target');
  });

  it('fails when file name does not exist in bucket', async () => {
    const service = new StorageService();
    storageMock.listFiles.mockResolvedValue({
      total: 1,
      files: [{ $id: 'first', name: 'other.json' }],
    });

    await expect(
      service.resolveFileIdByName({
        bucketId: 'bucket-pdfs',
        fileName: 'seed-data.json',
      }),
    ).rejects.toThrow('Seed source file "seed-data.json" was not found');
  });

  it('searches in the next page when first page has no match', async () => {
    const service = new StorageService();
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      $id: `first-${index}`,
      name: `first-${index}.json`,
    }));

    storageMock.listFiles
      .mockResolvedValueOnce({
        total: 101,
        files: firstPage,
      })
      .mockResolvedValueOnce({
        total: 101,
        files: [{ $id: 'target-second-page', name: 'seed-data.json' }],
      });

    await expect(
      service.resolveFileIdByName({
        bucketId: 'bucket-pdfs',
        fileName: 'seed-data.json',
      }),
    ).resolves.toBe('target-second-page');
  });

  it('fails when multiple files share the same name', async () => {
    const service = new StorageService();
    storageMock.listFiles.mockResolvedValue({
      total: 2,
      files: [
        { $id: 'a', name: 'seed-data.json' },
        { $id: 'b', name: 'seed-data.json' },
      ],
    });

    await expect(
      service.resolveFileIdByName({
        bucketId: 'bucket-pdfs',
        fileName: 'seed-data.json',
      }),
    ).rejects.toThrow('Multiple files named "seed-data.json" found');
  });

  it('maps file lookup failures to system exception', async () => {
    const service = new StorageService();
    storageMock.listFiles.mockRejectedValue({ code: 500 });

    await expect(
      service.resolveFileIdByName({
        bucketId: 'bucket-pdfs',
        fileName: 'seed-data.json',
      }),
    ).rejects.toBeInstanceOf(AppwriteSystemException);
  });

  it('keeps Buffer payloads unchanged on download', async () => {
    const service = new StorageService();
    const original = Buffer.from([9, 8, 7]);
    storageMock.getFileDownload.mockResolvedValue(original);

    await expect(
      service.download({ fileId: 'f-buffer', bucketId: 'bucket-pdfs' }),
    ).resolves.toEqual(original);
  });

  it('downloads ArrayBuffer payloads as Buffer', async () => {
    const service = new StorageService();
    const payload = new Uint8Array([4, 5, 6]).buffer;
    storageMock.getFileDownload.mockResolvedValue(payload);

    await expect(
      service.download({ fileId: 'f-arraybuffer', bucketId: 'bucket-pdfs' }),
    ).resolves.toEqual(Buffer.from([4, 5, 6]));
  });

  it('downloads ArrayBuffer view payloads as Buffer', async () => {
    const service = new StorageService();
    const view = new DataView(new Uint8Array([7, 8, 9]).buffer);
    storageMock.getFileDownload.mockResolvedValue(view);

    await expect(
      service.download({ fileId: 'f-view', bucketId: 'bucket-pdfs' }),
    ).resolves.toEqual(Buffer.from([7, 8, 9]));
  });

  it('downloads JSON payloads as Buffer', async () => {
    const service = new StorageService();
    storageMock.getFileDownload.mockResolvedValue('{"ok":true}');

    const payload = await service.download({
      fileId: 'f2',
      bucketId: 'bucket-pdfs',
    });
    expect(payload).toBeInstanceOf(Buffer);
    expect(payload.toString('utf8')).toBe('{"ok":true}');
  });

  it('downloads numeric payloads as Buffer', async () => {
    const service = new StorageService();
    storageMock.getFileDownload.mockResolvedValue(42);

    const payload = await service.download({
      fileId: 'f-number',
      bucketId: 'bucket-pdfs',
    });

    expect(payload).toBeInstanceOf(Buffer);
    expect(payload.toString('utf8')).toBe('42');
  });

  it('downloads boolean payloads as Buffer', async () => {
    const service = new StorageService();
    storageMock.getFileDownload.mockResolvedValue(true);

    const payload = await service.download({
      fileId: 'f-boolean',
      bucketId: 'bucket-pdfs',
    });

    expect(payload).toBeInstanceOf(Buffer);
    expect(payload.toString('utf8')).toBe('true');
  });

  it('downloads object payloads as JSON Buffer', async () => {
    const service = new StorageService();
    storageMock.getFileDownload.mockResolvedValue({ ok: true });

    const payload = await service.download({
      fileId: 'f-object',
      bucketId: 'bucket-pdfs',
    });

    expect(payload).toBeInstanceOf(Buffer);
    expect(payload.toString('utf8')).toBe('{"ok":true}');
  });

  it('downloads array payloads as JSON Buffer', async () => {
    const service = new StorageService();
    storageMock.getFileDownload.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const payload = await service.download({
      fileId: 'f-array-json',
      bucketId: 'bucket-pdfs',
    });

    expect(payload).toBeInstanceOf(Buffer);
    expect(payload.toString('utf8')).toBe('[{"id":1},{"id":2}]');
  });

  it('downloads arrayBuffer-capable payloads as Buffer', async () => {
    const service = new StorageService();
    storageMock.getFileDownload.mockResolvedValue({
      arrayBuffer: async () => new Uint8Array([3, 2, 1]).buffer,
    });

    await expect(
      service.download({
        fileId: 'f-arraybuffer-method',
        bucketId: 'bucket-pdfs',
      }),
    ).resolves.toEqual(Buffer.from([3, 2, 1]));
  });

  it('maps download failures to system exception', async () => {
    const service = new StorageService();
    storageMock.getFileDownload.mockRejectedValue({ code: 500 });

    await expect(
      service.download({ fileId: 'f3', bucketId: 'bucket-pdfs' }),
    ).rejects.toBeInstanceOf(AppwriteSystemException);
  });

  it('maps unsupported download payloads to system exception', async () => {
    const service = new StorageService();
    storageMock.getFileDownload.mockResolvedValue(Symbol('payload'));

    await expect(
      service.download({ fileId: 'f-unsupported', bucketId: 'bucket-pdfs' }),
    ).rejects.toBeInstanceOf(AppwriteSystemException);
  });

  it('fails download when params are invalid', async () => {
    const service = new StorageService();

    await expect(
      service.download({ fileId: '', bucketId: 'bucket-pdfs' }),
    ).rejects.toBeDefined();
    await expect(
      service.download({ fileId: 'f4', bucketId: '' }),
    ).rejects.toBeDefined();
  });
});
