// experience

import type { Lib } from '@/components';

export interface ResumeExperienceItem {
  id: string;
  sort: number | null;
  company: string;
  position: string;
  duration: string;
}

export interface ResumeExperience {
  title: string;
  description: string;
  items: ResumeExperienceItem[];
}

// education

export interface ResumeEducationItem {
  institution: string;
  degree: string;
  duration: string;
}

export interface ResumeEducation {
  id: string;
  sort: number | null;
  title: string;
  description: string;
  items: ResumeEducationItem[];
}

// skills
const skillListTypes = ['frontend', 'fullstack', 'backend'] as const;
export type SkillListType = (typeof skillListTypes)[number];

export interface ResumeSkillsItem {
  id: string;
  sort: number | null;
  type: SkillListType;
  title: string;
  iconLib: Lib;
  iconCode: string;
}

export interface ResumeSkills {
  title: string;
  description: string;
  items: ResumeSkillsItem[];
}

// about
export interface ResumeAboutInfo {
  id: string;
  sort: number | null;
  fieldName: string;
  fieldValue: string;
}

export interface ResumeAbout {
  title: string;
  description: string;
  info: ResumeAboutInfo[];
}

export interface Resume {
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkills[];
  about: ResumeAbout[];
}
