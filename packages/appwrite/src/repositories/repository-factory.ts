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
      case 'contact_info':
        repo = new ContactInfoRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'educations':
        repo = new EducationRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'experiences':
        repo = new ExperienceRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'home':
        repo = new HomeRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'impact_metrics':
        repo = new ImpactMetricRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'metric_sources':
        repo = new MetricSourceRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'platforms':
        repo = new PlatformRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'skills':
        repo = new SkillRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'socials':
        repo = new SocialRepository(
          this.databaseId,
        ) as IRepository<RepositoryEntity>;
        break;
      case 'solutions':
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
