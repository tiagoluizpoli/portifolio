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

export interface IRepository<T extends RepositoryEntity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Record<string, unknown>): Promise<T>;
  update(id: string, data: Record<string, unknown>): Promise<T>;
  delete(id: string): Promise<void>;
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
  findByInternalCode(internalCode: string): Promise<ImpactMetricEntity | null>;
  findByAboutAndInternalCode(
    aboutId: string,
    internalCode: string,
  ): Promise<ImpactMetricEntity[]>;
}

export interface IMetricSyncService {
  sync(aboutId: string, source: ImpactMetricEntity): Promise<void>;
  cleanup(aboutId: string, internalCode: string): Promise<void>;
}
