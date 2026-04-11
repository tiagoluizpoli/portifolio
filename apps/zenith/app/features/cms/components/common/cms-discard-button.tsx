import { RefreshCcw } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CmsDiscardButtonProps extends ButtonProps {
  /**
   * Whether the CMS section is currently persisting data.
   */
  isSaving: boolean;
  /**
   * Whether the form is pristine (no changes made).
   * Defaults to false if not using a form-state selector.
   */
  isPristine?: boolean;
}

/**
 * CmsDiscardButton (Constitution §XIX)
 * Atomic component that decouples form resets from layout.
 * Provides a unified visual identity for "Portfolio CMS" discard actions.
 */
export function CmsDiscardButton({
  isSaving,
  isPristine = false,
  className,
  children,
  ...props
}: CmsDiscardButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPristine || isSaving}
      className={cn(
        'text-xs font-bold uppercase tracking-widest hover:bg-muted h-9 transition-all active:scale-95',
        className,
      )}
      {...props}
    >
      <RefreshCcw className="size-3 mr-2" />
      <span className="leading-none">{children || 'Discard Changes'}</span>
    </Button>
  );
}
