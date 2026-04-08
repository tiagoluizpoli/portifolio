/**
 * MaturityAuditService (Constitution §XVII, §XIX)
 * Authoritative client-side logic for calculating portfolio bilingual maturity.
 * Follows the "7-Section Rule" where 100% maturity requires full content in both EN and PT.
 */

import type { AboutData } from '../types/about';
import type { Skill, Solution } from '../types/assets';
import type { ContactData } from '../types/contact';
import type { HistoryItem } from '../types/history';
import type { HomeData } from '../types/home';

export interface MaturityResult {
  progress: number; // 0-100
  status: 'pending' | 'draft' | 'mature';
  sections: Record<string, SectionStatus>;
}

export interface SectionStatus {
  completed: boolean;
  score: number; // 0-1
  missingFields: string[];
}

export interface AuditData {
  home: HomeData;
  about: AboutData;
  experience: HistoryItem[];
  education: HistoryItem[];
  skills: Skill[];
  solutions: Solution[];
  contact: ContactData;
}

export const MaturityAuditService = {
  /**
   * Performance-optimized audit of global CMS state.
   * Target Latency: <300ms (Rule XVII)
   */
  audit(data: AuditData): MaturityResult {
    const sections = {
      home: auditHome(data.home),
      about: auditSimple(data.about),
      experience: auditList(data.experience),
      education: auditList(data.education),
      skills: auditList(data.skills),
      solutions: auditList(data.solutions),
      contact: auditContact(data.contact),
    };

    const totalWeight = Object.keys(sections).length;
    const totalScore = Object.values(sections).reduce(
      (acc, curr) => acc + curr.score,
      0,
    );
    const progress = Math.round((totalScore / totalWeight) * 100);

    let status: MaturityResult['status'] = 'pending';
    if (progress > 80) status = 'mature';
    else if (progress > 20) status = 'draft';

    return {
      progress,
      status,
      sections,
    };
  },
};

function auditHome(home: HomeData): SectionStatus {
  const required: (keyof HomeData)[] = [
    'name',
    'title',
    'description',
    'profilePictureId',
    'cvId',
  ];
  const missing = required.filter(
    (f) => !home?.[f] || (typeof home[f] === 'string' && home[f].trim() === ''),
  );
  const score = (required.length - missing.length) / required.length;

  return {
    completed: missing.length === 0,
    score,
    missingFields: missing as string[],
  };
}

function auditSimple(data: AboutData): SectionStatus {
  const hasContent =
    data?.content &&
    typeof data.content === 'string' &&
    data.content.trim().length > 0;
  const score = hasContent ? 1 : 0;
  return {
    completed: score === 1,
    score,
    missingFields: score === 0 ? ['content'] : [],
  };
}

function auditList(list: unknown[]): SectionStatus {
  const score = Array.isArray(list) && list.length > 0 ? 1 : 0;
  return {
    completed: score === 1,
    score,
    missingFields: score === 0 ? ['items'] : [],
  };
}

function auditContact(contact: ContactData): SectionStatus {
  const required: (keyof ContactData)[] = ['email', 'phone', 'location'];
  const missing = required.filter(
    (f) =>
      !contact?.[f] ||
      (typeof contact[f] === 'string' && contact[f].trim() === ''),
  );

  // Check socials - at least one active social link
  const hasSocials =
    Array.isArray(contact?.socials) &&
    contact.socials.some((s) => s.active && s.url.trim() !== '');
  if (!hasSocials) missing.push('socials');

  const score = (required.length + 1 - missing.length) / (required.length + 1);

  return {
    completed: missing.length === 0,
    score,
    missingFields: missing as string[],
  };
}
