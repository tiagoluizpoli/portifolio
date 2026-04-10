import type { Client } from 'node-appwrite';
import type { AboutData } from '../domain/cms/chapters/about.js';
import type { Skill, Solution } from '../domain/cms/chapters/assets.js';
import type { ContactData } from '../domain/cms/chapters/contact.js';
import type { HistoryItem } from '../domain/cms/chapters/history.js';
import type { HomeData } from '../domain/cms/chapters/home.js';
import type {
  ImpactMetric,
  MetricSource,
} from '../domain/cms/chapters/metrics.js';
import { AboutRepository } from '../infrastructure/repositories/about.repository.js';
import {
  SkillRepository,
  SolutionRepository,
} from '../infrastructure/repositories/assets.repository.js';
import { ContactRepository } from '../infrastructure/repositories/contact.repository.js';
import { HistoryRepository } from '../infrastructure/repositories/history.repository.js';
import { HomeRepository } from '../infrastructure/repositories/home.repository.js';
import {
  MetricRepository,
  MetricSourceRepository,
} from '../infrastructure/repositories/metric.repository.js';
import { StorageRepository } from '../infrastructure/repositories/storage.repository.js';

/**
 * CmsService
 * Hardened with strict type safety using domain models.
 */
export class CmsService {
  private homeRepo: HomeRepository;
  private aboutRepo: AboutRepository;
  private historyRepo: HistoryRepository;
  private skillRepo: SkillRepository;
  private solutionRepo: SolutionRepository;
  private metricRepo: MetricRepository;
  private metricSourceRepo: MetricSourceRepository;
  private contactRepo: ContactRepository;
  private storageRepo: StorageRepository;

  constructor(client: Client, databaseId: string) {
    this.homeRepo = new HomeRepository(client, databaseId);
    this.aboutRepo = new AboutRepository(client, databaseId);
    this.historyRepo = new HistoryRepository(client, databaseId);
    this.skillRepo = new SkillRepository(client, databaseId);
    this.solutionRepo = new SolutionRepository(client, databaseId);
    this.metricRepo = new MetricRepository(client, databaseId);
    this.metricSourceRepo = new MetricSourceRepository(client, databaseId);
    this.contactRepo = new ContactRepository(client, databaseId);
    this.storageRepo = new StorageRepository();
  }

  // --- Home ---
  async getHome(locale: string): Promise<HomeData | null> {
    return this.homeRepo.getByLocale(locale);
  }

  async saveHome(
    locale: string,
    data: Omit<HomeData, 'id'>,
  ): Promise<HomeData> {
    // Purge old files if they were replaced
    const existing = await this.homeRepo.getByLocale(locale);
    if (existing) {
      await this.purgeAsset('assets', existing.pictureId, data.pictureId);
      await this.purgeAsset('assets', existing.cvId, data.cvId);
    }

    return this.homeRepo.updateByLocale(locale, data);
  }

  // --- About & Metrics ---
  async getAbout(locale: string): Promise<AboutData | null> {
    const about = await this.aboutRepo.getByLocale(locale);
    if (!about) return null;

    const metrics = await this.metricRepo.getByAboutId(about.id);
    return { ...about, metrics };
  }

  async saveAbout(
    locale: string,
    data: Omit<AboutData, 'id'> & { metrics?: ImpactMetric[] },
  ): Promise<AboutData | null> {
    const { metrics, ...aboutData } = data;
    const aboutDto = {
      locale: aboutData.locale,
      content: aboutData.content,
    } as Omit<AboutData, 'id'>;

    const about = await this.aboutRepo.updateByLocale(locale, aboutDto);
    if (metrics) {
      await this.metricRepo.saveByAboutId(about.id, metrics);
    }
    return this.getAbout(locale);
  }

  // --- Metrics Sources (Shared) ---
  async getMetricSources(): Promise<MetricSource[]> {
    return this.metricSourceRepo.findAll();
  }

  async saveMetricSources(sources: MetricSource[]): Promise<void> {
    return this.metricSourceRepo.save(sources);
  }

  // --- History ---
  async getHistory(
    type: 'experience' | 'education',
    locale: string,
  ): Promise<HistoryItem[]> {
    return this.historyRepo.getByLocale(type, locale);
  }

  async saveHistory(
    type: 'experience' | 'education',
    locale: string,
    items: HistoryItem[],
  ): Promise<void> {
    return this.historyRepo.save(type, locale, items);
  }

  // --- Assets ---
  async getSkills(locale: string): Promise<Skill[]> {
    return this.skillRepo.getByLocale(locale);
  }

  async saveSkills(locale: string, skills: Skill[]): Promise<void> {
    return this.skillRepo.save(locale, skills);
  }

  async getSolutions(locale: string): Promise<Solution[]> {
    return this.solutionRepo.getByLocale(locale);
  }

  async saveSolutions(locale: string, solutions: Solution[]): Promise<void> {
    return this.solutionRepo.save(locale, solutions);
  }

  // --- Contact ---
  async getContact(locale: string): Promise<ContactData | null> {
    return this.contactRepo.getByLocale(locale);
  }

  async saveContact(
    locale: string,
    data: Omit<ContactData, 'id'>,
  ): Promise<ContactData> {
    // Purge old social icons if replaced
    const existing = await this.contactRepo.getByLocale(locale);
    if (existing) {
      for (const oldSocial of existing.socials) {
        const newSocial = data.socials.find((s) => s.id === oldSocial.id);
        if (newSocial) {
          await this.purgeAsset('assets', oldSocial.iconId, newSocial.iconId);
        } else {
          // Social was deleted entirely, purge icon
          await this.purgeAsset('assets', oldSocial.iconId);
        }
      }
    }

    return this.contactRepo.updateByLocale(locale, data);
  }

  /**
   * Helper to purge an asset from storage if it has been replaced or removed.
   */
  private async purgeAsset(bucketId: string, oldId?: string, newId?: string) {
    if (oldId && oldId !== newId) {
      try {
        await this.storageRepo.moveFile(bucketId, 'trash', oldId);
      } catch (_error) {
        // Silently continue
      }
    }
  }
}
