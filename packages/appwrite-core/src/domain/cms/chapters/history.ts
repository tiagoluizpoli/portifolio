/**
 * History Domain Model (Constitution §XVII)
 * Section 03/04: Professional Experience & Academic Foundation.
 */

export interface HistoryItem {
  id: string;
  locale: string;
  type: 'experience' | 'education';
  title: string;
  organization: string;
  location: string;
  period: string;
  description?: string;
  current: boolean;
  sort?: number;
}
