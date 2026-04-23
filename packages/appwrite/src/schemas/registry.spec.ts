import { asTableId } from '@repo/appwrite-core';
import { describe, expect, it } from 'vitest';
import {
  AboutFullSchema,
  AboutInsertSchema,
  AboutListSchema,
  ContactInfoFullSchema,
  ContactInfoInsertSchema,
  ContactInfoListSchema,
  EducationFullSchema,
  EducationInsertSchema,
  EducationListSchema,
  ExperienceFullSchema,
  ExperienceInsertSchema,
  ExperienceListSchema,
  HomeFullSchema,
  HomeInsertSchema,
  HomeListSchema,
  ImpactMetricFullSchema,
  ImpactMetricInsertSchema,
  ImpactMetricListSchema,
  MetricSourceFullSchema,
  MetricSourceInsertSchema,
  MetricSourceListSchema,
  PlatformFullSchema,
  PlatformInsertSchema,
  PlatformListSchema,
  SkillFullSchema,
  SkillInsertSchema,
  SkillListSchema,
  SocialFullSchema,
  SocialInsertSchema,
  SocialListSchema,
  SolutionFullSchema,
  SolutionInsertSchema,
  SolutionListSchema,
} from './registry';

const systemFields = {
  id: asTableId('id_1'),
  createdAt: '2026-04-16T00:00:00.000Z',
  updatedAt: '2026-04-16T00:00:00.000Z',
  permissions: ['read("*")'],
};

const schemaCases = [
  {
    name: 'About',
    insertSchema: AboutInsertSchema,
    fullSchema: AboutFullSchema,
    listSchema: AboutListSchema,
    valid: { name: 'Tiago', title: 'Engineer', bio: 'Bio', locale: 'en' },
    missingKey: 'name',
  },
  {
    name: 'Home',
    insertSchema: HomeInsertSchema,
    fullSchema: HomeFullSchema,
    listSchema: HomeListSchema,
    valid: {
      locale: 'en',
      heroTitle: 'Hero',
      heroSubtitle: 'Subtitle',
      ctaText: 'Go',
      ctaLink: '/x',
    },
    missingKey: 'heroTitle',
  },
  {
    name: 'ContactInfo',
    insertSchema: ContactInfoInsertSchema,
    fullSchema: ContactInfoFullSchema,
    listSchema: ContactInfoListSchema,
    valid: {
      locale: 'en',
      email: 'tiago@example.com',
      phone: '1234',
      location: 'Remote',
    },
    missingKey: 'email',
  },
  {
    name: 'Social',
    insertSchema: SocialInsertSchema,
    fullSchema: SocialFullSchema,
    listSchema: SocialListSchema,
    valid: {
      platformId: 'platform-1',
      username: 'tiago',
      iconId: 'icon-1',
      active: true,
      sort: 1,
    },
    missingKey: 'platformId',
  },
  {
    name: 'Platform',
    insertSchema: PlatformInsertSchema,
    fullSchema: PlatformFullSchema,
    listSchema: PlatformListSchema,
    valid: {
      title: 'GitHub',
      urlTemplate: 'https://github.com/{username}',
      iconCode: 'github',
      status: 'active',
      sort: 1,
    },
    missingKey: 'title',
  },
  {
    name: 'Solution',
    insertSchema: SolutionInsertSchema,
    fullSchema: SolutionFullSchema,
    listSchema: SolutionListSchema,
    valid: {
      locale: 'en',
      title: 'API',
      description: 'desc',
      iconCode: 'api',
      sort: 1,
    },
    missingKey: 'title',
  },
  {
    name: 'Skill',
    insertSchema: SkillInsertSchema,
    fullSchema: SkillFullSchema,
    listSchema: SkillListSchema,
    valid: {
      title: 'TypeScript',
      type: 'frontend',
      iconCode: 'ts',
      status: 'active',
      sort: 1,
    },
    missingKey: 'title',
  },
  {
    name: 'Education',
    insertSchema: EducationInsertSchema,
    fullSchema: EducationFullSchema,
    listSchema: EducationListSchema,
    valid: {
      locale: 'en',
      title: 'BSc',
      organization: 'Uni',
      location: 'City',
      period: '2020-2024',
      description: 'desc',
      current: false,
      sort: 1,
    },
    missingKey: 'title',
  },
  {
    name: 'Experience',
    insertSchema: ExperienceInsertSchema,
    fullSchema: ExperienceFullSchema,
    listSchema: ExperienceListSchema,
    valid: {
      locale: 'en',
      title: 'Engineer',
      organization: 'Company',
      location: 'City',
      period: '2024-now',
      description: 'desc',
      current: true,
      sort: 1,
    },
    missingKey: 'title',
  },
  {
    name: 'ImpactMetric',
    insertSchema: ImpactMetricInsertSchema,
    fullSchema: ImpactMetricFullSchema,
    listSchema: ImpactMetricListSchema,
    valid: {
      aboutId: 'about-1',
      internalCode: 'm-1',
      locale: 'en',
      label: 'Years',
      value: '10+',
      sourceId: 'source-1',
      isPlaceholder: false,
    },
    missingKey: 'internalCode',
  },
  {
    name: 'MetricSource',
    insertSchema: MetricSourceInsertSchema,
    fullSchema: MetricSourceFullSchema,
    listSchema: MetricSourceListSchema,
    valid: {
      name: 'Manual',
      type: 'manual',
      iconCode: 'gear',
      status: 'active',
    },
    missingKey: 'name',
  },
] as const;

describe('Schema registry class 1-3', () => {
  it.each(schemaCases)('Class 1 Happy Path - $name', ({
    insertSchema,
    valid,
  }) => {
    expect(insertSchema.parse(valid)).toEqual(valid);
  });

  it.each(schemaCases)('Class 2 Edge Path - $name full/list parse', ({
    fullSchema,
    listSchema,
    valid,
  }) => {
    const full = { ...valid, ...systemFields };
    expect(fullSchema.parse(full)).toEqual(full);

    const list = {
      total: 1,
      rows: [full],
    };
    expect(listSchema.parse(list)).toEqual(list);
  });

  it.each(
    schemaCases,
  )('Class 3 Invalid Input - $name missing required field', ({
    insertSchema,
    valid,
    missingKey,
  }) => {
    const invalid = { ...valid } as Record<string, unknown>;
    delete invalid[missingKey];

    expect(() => insertSchema.parse(invalid)).toThrow();
  });
});
