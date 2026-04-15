import { CmsDiscardButton } from '../../common/cms-discard-button';
import { CmsSaveButton } from '../../common/cms-save-button';

interface SolutionsHeaderProps {
  isSaving: boolean;
  isPristine: boolean;
  canSubmit: boolean;
  onReset: () => void;
  onSubmit: () => void;
}

/**
 * SolutionsHeader (Constitution §XVII)
 * Composite component for Professional Offerings header.
 */
export function SolutionsHeader({
  isSaving,
  isPristine,
  canSubmit,
  onReset,
  onSubmit,
}: SolutionsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
          Professional Offerings
        </h2>
        <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold mt-1">
          Orchestrate your solution architectures and specialized services
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
          canSubmit={canSubmit && !isPristine}
          onClick={onSubmit}
        />
      </div>
    </div>
  );
}
