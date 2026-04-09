/**
 * Asset Entity Types (Constitution §XV, §I)
 * Covers Skills and Solutions chapters.
 */

export type SkillCategory = 'hard' | 'soft' | 'tool';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  icon: string; // Iconify name
  status: 'active' | 'archived';
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  icon: string; // Iconify name
  url?: string;
}

export const EMPTY_SKILL: Omit<Skill, 'id'> = {
  name: '',
  category: 'hard',
  icon: 'lucide:code',
  status: 'active',
};

export const EMPTY_SOLUTION: Omit<Solution, 'id'> = {
  title: '',
  description: '',
  icon: 'lucide:rocket',
  url: '',
};
