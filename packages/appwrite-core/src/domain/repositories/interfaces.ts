import { z } from 'zod';
import type { AboutData } from '../cms/chapters/about.js';
import type { Skill, Solution } from '../cms/chapters/assets.js';
import type { ContactData } from '../cms/chapters/contact.js';
import type { HistoryItem } from '../cms/chapters/history.js';
import type { HomeData } from '../cms/chapters/home.js';
import type { ImpactMetric, MetricSource } from '../cms/chapters/metrics.js';

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

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
  createdAt: z.string(),
});

export type Asset = z.infer<typeof AssetSchema>;

export interface IStorageRepository {
  uploadFile(
    bucketId: string,
    file: Buffer | Blob,
    fileName: string,
    fileId?: string,
  ): Promise<Asset>;
  getFilePreview(bucketId: string, fileId: string): Promise<URL>;
  getFileView(bucketId: string, fileId: string): Promise<URL>;
  getFile(bucketId: string, fileId: string): Promise<Asset>;
  downloadFile(bucketId: string, fileId: string): Promise<Response>;

  deleteFile(bucketId: string, fileId: string): Promise<void>;
}

export interface ICmsRepository<T> {
  getByLocale(locale: string): Promise<T | null>;
  updateByLocale(locale: string, data: Omit<T, 'id'>): Promise<T>;
}

export interface IHomeRepository extends ICmsRepository<HomeData> {}
export interface IAboutRepository extends ICmsRepository<AboutData> {
  getMetrics(aboutId: string): Promise<ImpactMetric[]>;
  saveMetrics(aboutId: string, metrics: ImpactMetric[]): Promise<void>;
}

export interface IHistoryRepository {
  getByLocale(
    type: 'experience' | 'education',
    locale: string,
  ): Promise<HistoryItem[]>;
  save(
    type: 'experience' | 'education',
    locale: string,
    items: HistoryItem[],
  ): Promise<void>;
}

export interface ISkillRepository {
  getByLocale(locale: string): Promise<Skill[]>;
  save(locale: string, items: Skill[]): Promise<void>;
}

export interface ISolutionRepository {
  getByLocale(locale: string): Promise<Solution[]>;
  save(locale: string, items: Solution[]): Promise<void>;
}

export interface IMetricSourceRepository {
  findAll(): Promise<MetricSource[]>;
  save(sources: MetricSource[]): Promise<void>;
}

export interface IContactRepository extends ICmsRepository<ContactData> {}
