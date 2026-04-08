import { useMemo } from 'react';
import { useCmsContext } from '../context/cms-context';
import { MaturityAuditService } from '../services/maturity-audit-service';

export type MaturityStatus = 'pending' | 'draft' | 'mature';

interface MaturityData {
  progress: number;
  status: MaturityStatus;
}

/**
 * useMaturityAudit (Constitution §XVII, §I)
 * Real-time administrative audit of the Portfolio CMS chapters.
 * Dynamically calculates bilingual completion metrics from the global CMS state.
 */
export function useMaturityAudit(): MaturityData {
  const { state, currentLocale } = useCmsContext();

  return useMemo(() => {
    // Audit all chapters for the CURRENT locale
    const dataForLocale = {
      home: state.home[currentLocale],
      about: state.about[currentLocale],
      experience: state.experience[currentLocale],
      education: state.education[currentLocale],
      skills: state.skills[currentLocale],
      solutions: state.solutions[currentLocale],
      contact: state.contact[currentLocale],
    };

    const result = MaturityAuditService.audit(dataForLocale);

    return {
      progress: result.progress,
      status: result.status,
    };
  }, [state, currentLocale]);
}
