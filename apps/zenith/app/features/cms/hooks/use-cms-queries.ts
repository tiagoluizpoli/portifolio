import { useQuery } from '@tanstack/react-query';
import * as CmsServer from '../../../infrastructure/cms/server';

export const CMS_KEYS = {
  all: ['cms'] as const,
  section: (section: string, locale: string) =>
    [...CMS_KEYS.all, section, locale] as const,
  home: (locale: string) => CMS_KEYS.section('home', locale),
  about: (locale: string) => CMS_KEYS.section('about', locale),
  history: (type: string, locale: string) =>
    [...CMS_KEYS.all, type, locale] as const,
  skills: (locale: string) => CMS_KEYS.section('skills', locale),
  solutions: (locale: string) => CMS_KEYS.section('solutions', locale),
  contact: (locale: string) => CMS_KEYS.section('contact', locale),
  metricSources: () => [...CMS_KEYS.all, 'metric-sources'] as const,
};

export function useHomeQuery(locale: string) {
  return useQuery({
    queryKey: CMS_KEYS.home(locale),
    queryFn: () =>
      // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
      (CmsServer.getHomeSection as any)({ data: locale }),
  });
}

export function useAboutQuery(locale: string) {
  return useQuery({
    queryKey: CMS_KEYS.about(locale),
    queryFn: () =>
      // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
      (CmsServer.getAboutSection as any)({ data: locale }),
  });
}

export function useHistoryQuery(
  type: 'experience' | 'education',
  locale: string,
) {
  return useQuery({
    queryKey: CMS_KEYS.history(type, locale),
    queryFn: () =>
      // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
      (CmsServer.getHistorySection as any)({ data: { type, locale } }),
  });
}

export function useSkillsQuery(locale: string) {
  return useQuery({
    queryKey: CMS_KEYS.skills(locale),
    queryFn: () =>
      // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
      (CmsServer.getSkillsSection as any)({ data: locale }),
  });
}

export function useSolutionsQuery(locale: string) {
  return useQuery({
    queryKey: CMS_KEYS.solutions(locale),
    queryFn: () =>
      // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
      (CmsServer.getSolutionsSection as any)({ data: locale }),
  });
}

export function useContactQuery(locale: string) {
  return useQuery({
    queryKey: CMS_KEYS.contact(locale),
    queryFn: () =>
      // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
      (CmsServer.getContactSection as any)({ data: locale }),
  });
}

export function useMetricSourcesQuery() {
  return useQuery({
    queryKey: CMS_KEYS.metricSources(),
    queryFn: () => CmsServer.getMetricSources(),
  });
}
