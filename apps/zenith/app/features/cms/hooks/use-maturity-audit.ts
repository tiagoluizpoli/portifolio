import { useCmsContext } from '../context/cms-context';
import type { MaturityStatus } from '../services/maturity-audit-service';

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
  const { maturity } = useCmsContext();

  return {
    progress: maturity.progress,
    status: maturity.status,
  };
}
