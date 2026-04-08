/**
 * History Entity Types (Constitution §XV, §I)
 * Used for both Experience and Education chapters.
 * Aligned with Appwrite Schema and Portfolio Manager Data Model.
 */

export interface HistoryItem {
  id: string;
  type: 'experience' | 'education';
  locale: 'en' | 'pt';
  mainTitle: string; // Role or Degree
  subTitle: string; // Company or Institution
  location: string;
  from: string; // ISO date or Year
  to: string | null;
  current: boolean;
  content: string; // Markdown description
  sort: number; // For kinetic reordering
}

export type HistoryFormState = Omit<HistoryItem, 'id'>;

export const EMPTY_HISTORY_ITEM: HistoryFormState = {
  type: 'experience',
  locale: 'en',
  mainTitle: '',
  subTitle: '',
  location: '',
  from: '',
  to: null,
  current: false,
  content: '',
  sort: 0,
};
