import type {
  AboutData,
  ContactData,
  HistoryItem,
  HomeData,
  Skill,
  Solution,
} from '@repo/appwrite-core/domain';

export type MaturityStatus = 'pending' | 'draft' | 'mature';

export interface AuditResult {
  progress: number;
  status: MaturityStatus;
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

/**
 * MaturityAuditService (Constitution §XVII, §I)
 * Pure logic for calculating bilingual portfolio completion.
 * Enforces strict validation rules for "Mature" status.
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Architectural singleton (§XVII)
export class MaturityAuditService {
  /**
   * Performs a comprehensive audit across all portfolio segments.
   */
  static audit(data: AuditData): AuditResult {
    const weights = {
      home: 20,
      about: 15,
      experience: 15,
      education: 10,
      skills: 15,
      solutions: 15,
      contact: 10,
    };

    const completion = {
      home: MaturityAuditService.auditHome(data.home),
      about: MaturityAuditService.auditAbout(data.about),
      experience: MaturityAuditService.auditHistory(data.experience),
      education: MaturityAuditService.auditHistory(data.education),
      skills: MaturityAuditService.auditSkills(data.skills),
      solutions: MaturityAuditService.auditSolutions(data.solutions),
      contact: MaturityAuditService.auditContact(data.contact),
    };

    const totalProgress = Object.entries(weights).reduce(
      (acc, [key, weight]) => {
        return (
          acc + completion[key as keyof typeof completion] * (weight / 100)
        );
      },
      0,
    );

    const progress = Math.round(totalProgress);

    let status: MaturityStatus = 'pending';
    if (progress >= 100) status = 'mature';
    else if (progress > 30) status = 'draft';

    return { progress, status };
  }

  private static auditHome(data?: HomeData): number {
    if (!data) return 0;
    const fields: (keyof HomeData)[] = [
      'firstName',
      'lastName',
      'title',
      'description',
      'pictureId',
    ];
    const filled = fields.filter((f) => !!data[f]).length;
    return (filled / fields.length) * 100;
  }

  private static auditAbout(data?: AboutData): number {
    if (!data?.content || data.content.length < 50) return 0;
    return 100;
  }

  private static auditHistory(items: HistoryItem[]): number {
    return items.length > 0 ? 100 : 0;
  }

  private static auditSkills(items: Skill[]): number {
    return items.length >= 3 ? 100 : 0;
  }

  private static auditSolutions(items: Solution[]): number {
    return items.length >= 2 ? 100 : 0;
  }

  private static auditContact(data?: ContactData): number {
    if (!data?.email || !data?.location) return 0;
    return 100;
  }
}
