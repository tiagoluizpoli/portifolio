import { z } from 'zod';

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export const HomeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

export type Home = z.infer<typeof HomeSchema>;

export const PortfolioSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
});

export type Portfolio = z.infer<typeof PortfolioSchema>;

export const AssetSchema = z.object({
  id: z.string(),
  bucketId: z.string(),
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

export type Asset = z.infer<typeof AssetSchema>;

export interface IStorageRepository {
  uploadFile(
    bucketId: string,
    file: Buffer | Blob,
    fileName: string,
    fileId?: string,
  ): Promise<Asset>;
  getFilePreview(bucketId: string, fileId: string): URL;
  deleteFile(bucketId: string, fileId: string): Promise<void>;
}
