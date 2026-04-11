/**
 * Assets Domain Model (Constitution §XVII)
 * Section 05/06: Technical Stack & Solution Architecture.
 */

export interface Skill {
  id: string;
  title: string;
  type: 'frontend' | 'backend' | 'fullstack';
  iconCode: string;
  iconId?: string;
  status: 'active' | 'archived';
  sort?: number;
}

export interface Solution {
  id: string;
  locale: string;
  title: string;
  description?: string;
  iconCode: string;
  iconId?: string;
  sort?: number;
}
