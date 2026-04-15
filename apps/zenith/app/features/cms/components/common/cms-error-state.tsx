import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CmsErrorStateProps {
  /**
   * Name of the section (e.g., "Platforms", "Solutions").
   * Used in the heading: "Unable to Load [sectionName]"
   */
  sectionName: string;

  /**
   * Custom error message.
   * If empty, a generic message is used.
   */
  errorMessage?: string;

  /**
   * Optional error code/reference for debugging.
   * Displayed as small secondary text.
   */
  errorCode?: string;

  /**
   * Callback fired when the user clicks the retry button.
   */
  onRetry?: () => void;

  /**
   * Callback fired when the user clicks the dismiss/back button.
   */
  onDismiss?: () => void;

  /**
   * Optional custom icon. Defaults to AlertTriangle.
   */
  icon?: React.ReactNode;

  /**
   * Optional className for custom sizing/styling.
   */
  className?: string;

  /**
   * Show retry button? Defaults to true if onRetry is provided.
   */
  showRetry?: boolean;

  /**
   * Show dismiss button? Defaults to true if onDismiss is provided.
   */
  showDismiss?: boolean;
}

/**
 * CmsErrorState (Constitution §XVII)
 * Global reusable error state component for all CMS collections.
 * Displays when data fetch fails or connection is lost (Appwrite offline, etc.).
 *
 * Follows the Oceanic Obsidian design system:
 * - Warning icon (Alert gold)
 * - Semi-bold heading
 * - Error message and optional code
 * - Retry and Dismiss action buttons
 */
export function CmsErrorState({
  sectionName,
  errorMessage,
  errorCode,
  onRetry,
  onDismiss,
  icon,
  className,
  showRetry = !!onRetry,
  showDismiss = !!onDismiss,
}: CmsErrorStateProps) {
  const defaultErrorMessage = `Unable to load ${sectionName.toLowerCase()}. Please check your connection and try again.`;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 rounded-xl',
        'border border-dashed border-destructive/30 bg-destructive/5',
        className,
      )}
    >
      {/* Icon */}
      <div className="mb-4 flex items-center justify-center size-12 rounded-lg bg-destructive/10">
        {icon || (
          <AlertTriangle className="size-6 text-destructive/70 opacity-70" />
        )}
      </div>

      {/* Heading */}
      <h3 className="text-sm font-bold uppercase tracking-tight text-destructive mb-2">
        Unable to Load {sectionName}
      </h3>

      {/* Error Message */}
      <p className="text-xs text-muted-foreground/60 text-center max-w-xs mb-2">
        {errorMessage || defaultErrorMessage}
      </p>

      {/* Error Code */}
      {errorCode && (
        <p className="text-[10px] font-mono text-muted-foreground/40 mb-6">
          Error: {errorCode}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            variant="default"
            size="sm"
            className="h-8 text-xs font-bold uppercase tracking-widest bg-primary hover:bg-primary/90"
          >
            <RotateCw className="size-3 mr-2" />
            Retry
          </Button>
        )}

        {showDismiss && onDismiss && (
          <Button
            onClick={onDismiss}
            variant="outline"
            size="sm"
            className="h-8 text-xs font-bold uppercase tracking-widest border-border/40"
          >
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
