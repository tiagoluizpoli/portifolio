import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AppwriteAuthException,
  AppwriteSystemException,
} from '../errors/appwrite-errors';

let sdkMock = {
  getRow: vi.fn(),
  listRows: vi.fn(),
  createRow: vi.fn(),
  updateRow: vi.fn(),
  deleteRow: vi.fn(),
};

vi.mock('../client', () => ({
  getTablesClient: () => sdkMock,
}));

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
} from './specialized-repositories';

describe('Specialized repositories', () => {
  beforeEach(() => {
    sdkMock = {
      getRow: vi.fn(),
      listRows: vi.fn(),
      createRow: vi.fn(),
      updateRow: vi.fn(),
      deleteRow: vi.fn(),
    };
  });

  it('instantiates all 11 repositories', () => {
    const repositories = [
      new AboutRepository('db'),
      new HomeRepository('db'),
      new ContactInfoRepository('db'),
      new SocialRepository('db'),
      new PlatformRepository('db'),
      new SolutionRepository('db'),
      new SkillRepository('db'),
      new EducationRepository('db'),
      new ExperienceRepository('db'),
      new ImpactMetricRepository('db'),
      new MetricSourceRepository('db'),
    ];

    expect(repositories).toHaveLength(11);
  });

  it('Class 1 happy path returns parsed entity', async () => {
    const repository = new AboutRepository('db');
    sdkMock.getRow.mockResolvedValue({
      $id: '1',
      $createdAt: 'now',
      $updatedAt: 'now',
      $permissions: [],
      name: 'A',
      title: 'T',
      bio: 'B',
      locale: 'en',
    });

    await expect(repository.findById({ id: '1' })).resolves.toMatchObject({
      id: '1',
    });
  });

  it('Class 2 edge path returns null for 404', async () => {
    const repository = new HomeRepository('db');
    sdkMock.getRow.mockRejectedValue({ code: 404 });
    await expect(repository.findById({ id: 'missing' })).resolves.toBeNull();
  });

  it('Class 4 auth path maps 401 to AppwriteAuthException', async () => {
    const repository = new SocialRepository('db');
    sdkMock.listRows.mockRejectedValue({ code: 401 });
    await expect(repository.findAll()).rejects.toBeInstanceOf(
      AppwriteAuthException,
    );
  });

  it('Class 5 system path maps 500 to AppwriteSystemException', async () => {
    const repository = new PlatformRepository('db');
    sdkMock.createRow.mockRejectedValue({ code: 500 });
    await expect(
      repository.create({ data: { title: 'x' } }),
    ).rejects.toBeInstanceOf(AppwriteSystemException);
  });

  it('impact metric repository supports findByInternalCode', async () => {
    const repository = new ImpactMetricRepository('db');
    sdkMock.listRows.mockResolvedValue({
      total: 1,
      rows: [
        {
          $id: '1',
          $createdAt: 'now',
          $updatedAt: 'now',
          $permissions: [],
          aboutId: 'a',
          internalCode: 'metric-1',
          locale: 'en',
          label: 'L',
          value: 'V',
          sourceId: 's',
          isPlaceholder: false,
        },
      ],
    });

    await expect(
      repository.findByInternalCode({ internalCode: 'metric-1' }),
    ).resolves.toMatchObject({
      internalCode: 'metric-1',
    });
  });

  it('impact metric repository returns null when query is empty', async () => {
    const repository = new ImpactMetricRepository('db');
    sdkMock.listRows.mockResolvedValue({ total: 0, rows: [] });
    await expect(
      repository.findByInternalCode({ internalCode: 'none' }),
    ).resolves.toBeNull();
  });

  it('impact metric repository supports findByAboutAndInternalCode', async () => {
    const repository = new ImpactMetricRepository('db');
    sdkMock.listRows.mockResolvedValue({
      total: 1,
      rows: [
        {
          $id: '1',
          $createdAt: 'now',
          $updatedAt: 'now',
          $permissions: [],
          aboutId: 'about-1',
          internalCode: 'metric-1',
          locale: 'en',
          label: 'L',
          value: 'V',
          sourceId: 's',
          isPlaceholder: false,
        },
      ],
    });

    await expect(
      repository.findByAboutAndInternalCode({
        aboutId: 'about-1',
        internalCode: 'metric-1',
      }),
    ).resolves.toHaveLength(1);
  });
});
