import { describe, expect, it, vi } from 'vitest';
import { AppwriteSystemException } from '../errors/appwrite-errors.js';
import { RepositoryFactory } from './repository-factory.js';
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

vi.mock('../client.js', () => ({
  getTablesClient: vi.fn().mockReturnValue({}),
}));

describe('RepositoryFactory', () => {
  it('instantiates all recognized repositories correctly', () => {
    const factory = new RepositoryFactory('db-123');

    expect(factory.getRepository('about')).toBeInstanceOf(AboutRepository);
    expect(factory.getRepository('contact_info')).toBeInstanceOf(
      ContactInfoRepository,
    );
    expect(factory.getRepository('educations')).toBeInstanceOf(
      EducationRepository,
    );
    expect(factory.getRepository('experiences')).toBeInstanceOf(
      ExperienceRepository,
    );
    expect(factory.getRepository('home')).toBeInstanceOf(HomeRepository);
    expect(factory.getRepository('impact_metrics')).toBeInstanceOf(
      ImpactMetricRepository,
    );
    expect(factory.getRepository('metric_sources')).toBeInstanceOf(
      MetricSourceRepository,
    );
    expect(factory.getRepository('platforms')).toBeInstanceOf(
      PlatformRepository,
    );
    expect(factory.getRepository('skills')).toBeInstanceOf(SkillRepository);
    expect(factory.getRepository('socials')).toBeInstanceOf(SocialRepository);
    expect(factory.getRepository('solutions')).toBeInstanceOf(
      SolutionRepository,
    );
  });

  it('reuses existing instances on subsequent calls', () => {
    const factory = new RepositoryFactory('db-123');
    const first = factory.getRepository('about');
    const second = factory.getRepository('about');

    expect(first).toBe(second);
  });

  it('throws AppwriteSystemException for unknown tables', () => {
    const factory = new RepositoryFactory('db-123');

    expect(() => factory.getRepository('unknown')).toThrow(
      AppwriteSystemException,
    );
    expect(() => factory.getRepository('unknown')).toThrow(
      /No repository configured for table unknown/,
    );
  });
});
