/* v8 ignore start */
export interface RepositoryEntity {
  id: string;
}

export interface ImpactMetricEntity extends RepositoryEntity {
  aboutId: string;
  internalCode: string;
  locale: 'en' | 'pt';
  label: string;
  value: string;
  sourceId: string;
  isPlaceholder: boolean;
}

export interface RepositoryFindByIdInput {
  id: string;
}

export interface RepositoryCreateInput {
  data: Record<string, unknown>;
}

export interface RepositoryUpdateInput {
  id: string;
  data: Record<string, unknown>;
}

export interface RepositoryDeleteInput {
  id: string;
}

export interface ImpactMetricFindByInternalCodeInput {
  internalCode: string;
}

export interface ImpactMetricFindByAboutAndInternalCodeInput {
  aboutId: string;
  internalCode: string;
}

export interface MetricSyncInput {
  aboutId: string;
  source: ImpactMetricEntity;
}

export interface MetricCleanupInput {
  aboutId: string;
  internalCode: string;
}

export interface IRepository<T extends RepositoryEntity> {
  findById(input: RepositoryFindByIdInput): Promise<T | null>;
  findMany(queries: string[]): Promise<T[]>;
  findAll(): Promise<T[]>;
  create(input: RepositoryCreateInput): Promise<T>;
  update(input: RepositoryUpdateInput): Promise<T>;
  delete(input: RepositoryDeleteInput): Promise<void>;
}

export interface IAboutRepository extends IRepository<{ id: string }> {}
export interface IHomeRepository extends IRepository<{ id: string }> {}
export interface IContactInfoRepository extends IRepository<{ id: string }> {}
export interface ISocialRepository extends IRepository<{ id: string }> {}
export interface IPlatformRepository extends IRepository<{ id: string }> {}
export interface ISolutionRepository extends IRepository<{ id: string }> {}
export interface ISkillRepository extends IRepository<{ id: string }> {}
export interface IEducationRepository extends IRepository<{ id: string }> {}
export interface IExperienceRepository extends IRepository<{ id: string }> {}
export interface IMetricSourceRepository extends IRepository<{ id: string }> {}

export interface IImpactMetricRepository
  extends IRepository<ImpactMetricEntity> {
  findByInternalCode(
    input: ImpactMetricFindByInternalCodeInput,
  ): Promise<ImpactMetricEntity | null>;
  findByAboutAndInternalCode(
    input: ImpactMetricFindByAboutAndInternalCodeInput,
  ): Promise<ImpactMetricEntity[]>;
}

export interface IMetricSyncService {
  sync(input: MetricSyncInput): Promise<void>;
  cleanup(input: MetricCleanupInput): Promise<void>;
}
/* v8 ignore stop */
