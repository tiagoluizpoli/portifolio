/**
 * About Entity Types (Constitution §XV, §I)
 * Aligned with Appwrite Schema and Portfolio Manager Data Model.
 */

export interface ImpactMetric {
  id: string;
  label: string; // e.g., 'Years of Experience'
  value: string; // e.g., '5+'
  source: 'manual' | 'custom';
  sourceKey?: string; // e.g., 'github_commits', 'npm_downloads'
}

export interface AboutData {
  id: string; // e.g., 'about-en'
  locale: 'en' | 'pt';
  content: string; // Professional bio narrative
  stats: ImpactMetric[];
}

export type AboutFormState = Omit<AboutData, 'id'>;

export const EMPTY_ABOUT: AboutFormState = {
  locale: 'en',
  content: '',
  stats: [],
};
