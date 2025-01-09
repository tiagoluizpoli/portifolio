// experience

import type { Lib } from '@/components';

export interface ResumeExperienceItem {
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
  title: string;
  description: string;
  items: ResumeEducationItem[];
}

// skills
const skillListTypes = ['frontend', 'fullstack', 'backend'] as const;
export type SkillListType = (typeof skillListTypes)[number];

export interface ResumeSkillsItemIcon {
  lib: Lib;
  name: string;
}

export interface ResumeSkillsItem {
  type: SkillListType;
  title: string;
  icon: ResumeSkillsItemIcon;
}

export interface ResumeSkills {
  title: string;
  description: string;
  items: ResumeSkillsItem[];
}

// about
export interface ResumeAboutInfo {
  fieldName: string;
  fieldValue: string;
}

export interface ResumeAbout {
  title: string;
  description: string;
  info: ResumeAboutInfo[];
}

export interface Resume {
  experience: ResumeExperience;
  education: ResumeEducation;
  skills: ResumeSkills;
  about: ResumeAbout;
}
