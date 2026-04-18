import { Query } from 'node-appwrite';
import type { z } from 'zod';
import { getTablesClient } from '../client.js';
import {
  type AboutFull,
  AboutFullSchema,
  type ContactInfoFull,
  ContactInfoFullSchema,
  type EducationFull,
  EducationFullSchema,
  type ExperienceFull,
  ExperienceFullSchema,
  type HomeFull,
  HomeFullSchema,
  type ImpactMetricFull,
  ImpactMetricFullSchema,
  type MetricSourceFull,
  MetricSourceFullSchema,
  type PlatformFull,
  PlatformFullSchema,
  type SkillFull,
  SkillFullSchema,
  type SocialFull,
  SocialFullSchema,
  type SolutionFull,
  SolutionFullSchema,
} from '../schemas/registry.js';
import { InternalLogger } from '../utils/logger.js';
import { BaseRepository } from './base-repository.js';
import type {
  IAboutRepository,
  IContactInfoRepository,
  IEducationRepository,
  IExperienceRepository,
  IHomeRepository,
  IImpactMetricRepository,
  IMetricSourceRepository,
  ImpactMetricFindByAboutAndInternalCodeInput,
  ImpactMetricFindByInternalCodeInput,
  IPlatformRepository,
  ISkillRepository,
  ISocialRepository,
  ISolutionRepository,
  RepositoryEntity,
} from './interfaces.js';

abstract class ValidatedRepository<
  T extends RepositoryEntity,
> extends BaseRepository<T> {
  constructor(
    databaseId: string,
    collectionId: string,
    private readonly schema: z.ZodSchema<T>,
    logger: InternalLogger = new InternalLogger(),
  ) {
    super(getTablesClient(), databaseId, collectionId, logger);
  }

  protected parse(entity: Record<string, unknown>): T {
    return this.schema.parse(entity);
  }
}

export class AboutRepository
  extends ValidatedRepository<AboutFull>
  implements IAboutRepository
{
  constructor(databaseId: string, logger?: InternalLogger) {
    super(databaseId, 'about', AboutFullSchema, logger);
  }
}

export class HomeRepository
  extends ValidatedRepository<HomeFull>
  implements IHomeRepository
{
  constructor(databaseId: string, logger?: InternalLogger) {
    super(databaseId, 'home', HomeFullSchema, logger);
  }
}

export class ContactInfoRepository
  extends ValidatedRepository<ContactInfoFull>
  implements IContactInfoRepository
{
  constructor(databaseId: string, logger?: InternalLogger) {
    super(databaseId, 'contact-info', ContactInfoFullSchema, logger);
  }
}

export class SocialRepository
  extends ValidatedRepository<SocialFull>
  implements ISocialRepository
{
  constructor(databaseId: string, logger?: InternalLogger) {
    super(databaseId, 'social', SocialFullSchema, logger);
  }
}

export class PlatformRepository
  extends ValidatedRepository<PlatformFull>
  implements IPlatformRepository
{
  constructor(databaseId: string, logger?: InternalLogger) {
    super(databaseId, 'platform', PlatformFullSchema, logger);
  }
}

export class SolutionRepository
  extends ValidatedRepository<SolutionFull>
  implements ISolutionRepository
{
  constructor(databaseId: string, logger?: InternalLogger) {
    super(databaseId, 'solution', SolutionFullSchema, logger);
  }
}

export class SkillRepository
  extends ValidatedRepository<SkillFull>
  implements ISkillRepository
{
  constructor(databaseId: string, logger?: InternalLogger) {
    super(databaseId, 'skill', SkillFullSchema, logger);
  }
}

export class EducationRepository
  extends ValidatedRepository<EducationFull>
  implements IEducationRepository
{
  constructor(databaseId: string, logger?: InternalLogger) {
    super(databaseId, 'education', EducationFullSchema, logger);
  }
}

export class ExperienceRepository
  extends ValidatedRepository<ExperienceFull>
  implements IExperienceRepository
{
  constructor(databaseId: string, logger?: InternalLogger) {
    super(databaseId, 'experience', ExperienceFullSchema, logger);
  }
}

export class ImpactMetricRepository
  extends ValidatedRepository<ImpactMetricFull>
  implements IImpactMetricRepository
{
  constructor(databaseId: string, logger?: InternalLogger) {
    super(databaseId, 'impact-metric', ImpactMetricFullSchema, logger);
  }

  async findByInternalCode(
    input: ImpactMetricFindByInternalCodeInput,
  ): Promise<ImpactMetricFull | null> {
    const { internalCode } = input;
    const result = await this.runQuery([
      Query.equal('internalCode', internalCode),
    ]);
    return result[0] ?? null;
  }

  async findByAboutAndInternalCode(
    input: ImpactMetricFindByAboutAndInternalCodeInput,
  ): Promise<ImpactMetricFull[]> {
    const { aboutId, internalCode } = input;
    return this.runQuery([
      Query.equal('aboutId', aboutId),
      Query.equal('internalCode', internalCode),
    ]);
  }
}

export class MetricSourceRepository
  extends ValidatedRepository<MetricSourceFull>
  implements IMetricSourceRepository
{
  constructor(databaseId: string, logger?: InternalLogger) {
    super(databaseId, 'metric-source', MetricSourceFullSchema, logger);
  }
}
