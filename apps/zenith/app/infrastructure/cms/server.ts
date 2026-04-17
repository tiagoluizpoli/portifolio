import type {
  AboutData,
  ContactData,
  HistoryItem,
  HomeData,
  MetricSource,
  Platform,
  Skill,
  Solution,
} from '@repo/appwrite-core/domain';
import type { AppwriteEnv } from '@repo/appwrite-core/infrastructure';
import { createServerFn } from '@tanstack/react-start';
import {
  AppwriteProvider,
  CmsService,
} from '../../../../../packages/appwrite-core/src/server';
import { bootstrapAppwriteRuntime } from '../appwrite/bootstrap.js';

function getService(): CmsService {
  const env = bootstrapAppwriteRuntime();
  AppwriteProvider.initialize(env as unknown as AppwriteEnv);
  return new CmsService(AppwriteProvider.client, env.APPWRITE_DATABASE_ID, [
    'en',
    'pt',
  ]);
}

// --- Home ---
export const getHomeSection = createServerFn({ method: 'GET' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const locale = (ctx as any).data as string;
    return getService().getHome(locale);
  },
);

export const saveHomeSection = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const { locale, data } = (ctx as any).data as {
      locale: string;
      data: HomeData;
    };
    return getService().saveHome(locale, data);
  },
);

// --- About ---
export const getAboutSection = createServerFn({ method: 'GET' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const locale = (ctx as any).data as string;
    return getService().getAbout(locale);
  },
);

export const saveAboutSection = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const { locale, data } = (ctx as any).data as {
      locale: string;
      data: AboutData;
    };
    return getService().saveAbout(locale, data);
  },
);

// --- History ---
export const getHistorySection = createServerFn({ method: 'GET' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const { type, locale } = (ctx as any).data as {
      type: 'experience' | 'education';
      locale: string;
    };
    return getService().getHistory(type, locale);
  },
);

export const saveHistorySection = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const { type, locale, items } = (ctx as any).data as {
      type: 'experience' | 'education';
      locale: string;
      items: HistoryItem[];
    };
    return getService().saveHistory(type, locale, items);
  },
);

// --- Skills & Solutions ---
export const getSkillsSection = createServerFn({ method: 'GET' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const locale = (ctx as any).data as string;
    return getService().getSkills(locale);
  },
);

export const saveSkillsSection = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const { locale, items } = (ctx as any).data as {
      locale: string;
      items: Skill[];
    };
    return getService().saveSkills(locale, items);
  },
);

export const getSolutionsSection = createServerFn({ method: 'GET' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const locale = (ctx as any).data as string;
    return getService().getSolutions(locale);
  },
);

export const saveSolutionsSection = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const { locale, items } = (ctx as any).data as {
      locale: string;
      items: Solution[];
    };
    return getService().saveSolutions(locale, items);
  },
);

// --- Metric Sources ---
export const getMetricSources = createServerFn({ method: 'GET' }).handler(
  async () => {
    return getService().getMetricSources();
  },
);

export const saveMetricSources = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const sources = (ctx as any).data as MetricSource[];
    return getService().saveMetricSources(sources);
  },
);

// --- Platforms ---
export const getPlatforms = createServerFn({ method: 'GET' }).handler(
  async () => {
    return getService().getPlatforms();
  },
);

export const savePlatforms = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const platforms = (ctx as any).data as Platform[];
    return getService().savePlatforms(platforms);
  },
);

// --- Contact ---
export const getContactSection = createServerFn({ method: 'GET' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const locale = (ctx as any).data as string;
    return getService().getContact(locale);
  },
);

export const saveContactSection = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const { locale, data } = (ctx as any).data as {
      locale: string;
      data: ContactData;
    };
    return getService().saveContact(locale, data);
  },
);
