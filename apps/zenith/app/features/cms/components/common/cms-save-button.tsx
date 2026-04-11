import { Loader2, Save } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CmsSaveButtonProps extends ButtonProps {
  /**
   * Whether the CMS section is currently persisting data.
   */
  isSaving: boolean;
  /**
   * Whether the form is valid and ready for submission.
   * Defaults to true if not using a form-state selector.
   */
  canSubmit?: boolean;
}

/**
 * CmsSaveButton (Constitution §XIX)
 * Atomic component that decouples persistence triggers from form layout.
 * Provides a unified visual identity for "Portfolio CMS" actions.
 */
export function CmsSaveButton({
  isSaving,
  canSubmit = true,
  className,
  children,
  ...props
}: CmsSaveButtonProps) {
  return (
    <Button
      size="sm"
      variant="default"
      disabled={!canSubmit || isSaving}
      className={cn(
        'bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest h-9 shadow-lg shadow-primary/20 transition-all active:scale-95',
        className,
      )}
      {...props}
    >
      {isSaving ? (
        <Loader2 className="size-3 mr-2 animate-spin" />
      ) : (
        <Save className="size-3 mr-2" />
      )}
      <span className="leading-none">{children || 'Save Changes'}</span>
    </Button>
  );
}
