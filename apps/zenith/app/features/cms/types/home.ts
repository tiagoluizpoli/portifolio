/**
 * Home Entity Types (Constitution §XV, §I)
 * Aligned with Appwrite Schema and Portfolio Manager Data Model.
 */

export interface HomeData {
  id: string; // e.g., 'home-en'
  locale: 'en' | 'pt';
  name: string;
  title: string; // Headline punchline
  description: string; // Bio narrative
  profilePictureId: string; // Shared across locales
  cvId: string; // Locale-specific asset
}

export type HomeFormState = Omit<HomeData, 'id'>;

export const EMPTY_HOME: HomeFormState = {
  locale: 'en',
  name: '',
  title: '',
  description: '',
  profilePictureId: '',
  cvId: '',
};
