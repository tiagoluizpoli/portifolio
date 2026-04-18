import { AppwriteSystemException } from '../errors/appwrite-errors.js';
import type { IRepository, RepositoryEntity } from './interfaces.js';
import {
  AboutRepository,
  ContactInfoRepository,
  EducationRepository,
  ExperienceRepository,
  HomeRepository,
  ImpactMetricRepository,
  MetricSourceRepository,
  PlatformRepository,
  SkillRepository,
  SocialRepository,
  SolutionRepository,
} from './specialized-repositories.js';

export class RepositoryFactory {
  private repositories: Map<string, IRepository<RepositoryEntity>> = new Map();

  constructor(private readonly databaseId: string) {}

  getRepository(tableId: string): IRepository<RepositoryEntity> {
    const existing = this.repositories.get(tableId);
    if (existing) {
      return existing;
    }

    let repo: IRepository<RepositoryEntity>;

    switch (tableId) {
      case 'about':
        repo = new AboutRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'contact-info':
        repo = new ContactInfoRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'education':
        repo = new EducationRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'experience':
        repo = new ExperienceRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'home':
        repo = new HomeRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'impact-metric':
        repo = new ImpactMetricRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'metric-source':
        repo = new MetricSourceRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'platform':
        repo = new PlatformRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'skill':
        repo = new SkillRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'social':
        repo = new SocialRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'solution':
        repo = new SolutionRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      default:
        throw new AppwriteSystemException(
          `No repository configured for table ${tableId}`,
        );
    }

    this.repositories.set(tableId, repo);
    return repo;
  }
}
