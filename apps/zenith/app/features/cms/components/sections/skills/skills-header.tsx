import { CmsDiscardButton } from '../../common/cms-discard-button';
import { CmsSaveButton } from '../../common/cms-save-button';

interface SkillsHeaderProps {
  isSaving: boolean;
  isPristine: boolean;
  canSubmit: boolean;
  onReset: () => void;
  onSubmit: () => void;
}

/**
 * SkillsHeader (Constitution §XVII)
 * Composite component for Technical Ordinance header and persistent triggers.
 */
export function SkillsHeader({
  isSaving,
  isPristine,
  canSubmit,
  onReset,
  onSubmit,
}: SkillsHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/40">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
          Technical Ordinance
        </h2>
        <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold mt-1">
          Curate and categorize your engineering competencies
        </p>
      </div>

      <div className="flex items-center gap-3">
        <CmsDiscardButton
          isSaving={isSaving}
          isPristine={isPristine}
          onClick={onReset}
        />
        <CmsSaveButton
          isSaving={isSaving}
          canSubmit={canSubmit}
          onClick={onSubmit}
        />
      </div>
    </div>
  );
}
