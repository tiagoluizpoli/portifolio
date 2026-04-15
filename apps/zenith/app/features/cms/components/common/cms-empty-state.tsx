import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CmsEmptyStateProps {
  /**
   * Name of the section (e.g., "Platform", "Solution", "Metric").
   * Used in the heading: "No [sectionName] Yet"
   */
  sectionName: string;

  /**
   * Custom description message.
   * If empty, a generic message is used.
   */
  description?: string;

  /**
   * Optional custom icon. Defaults to a muted CircleAlert.
   */
  icon?: React.ReactNode;

  /**
   * Callback fired when the user clicks the action button.
   */
  onAction?: () => void;

  /**
   * Custom label for the action button. Defaults to "Create [sectionName]".
   */
  actionLabel?: string;

  /**
   * Optional className for custom sizing/styling.
   */
  className?: string;

  /**
   * Show action button? Defaults to true if onAction is provided.
   */
  showAction?: boolean;
}

/**
 * CmsEmptyState (Constitution §XVII)
 * Global reusable empty state component for all CMS collections.
 * Displays when data loads successfully but contains no items.
 *
 * Follows the Oceanic Obsidian design system:
 * - Muted violet icon
 * - Lavender heading
 * - Optional action button with violet gradient
 */
export function CmsEmptyState({
  sectionName,
  description,
  icon,
  onAction,
  actionLabel,
  className,
  showAction = !!onAction,
}: CmsEmptyStateProps) {
  const defaultDescription = `Create your first ${sectionName.toLowerCase()} to get started.`;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 rounded-xl',
        'border border-dashed border-border/40 bg-muted/10',
        className,
      )}
    >
      {/* Icon */}
      <div className="mb-4 flex items-center justify-center size-12 rounded-lg bg-primary/5">
        {icon || <AlertCircle className="size-6 text-primary/50 opacity-60" />}
      </div>

      {/* Heading */}
      <h3 className="text-sm font-black uppercase tracking-tight text-foreground mb-2">
        No {sectionName} Yet
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground/60 text-center max-w-xs mb-6">
        {description || defaultDescription}
      </p>

      {/* Action Button */}
      {showAction && onAction && (
        <Button
          onClick={onAction}
          variant="default"
          size="sm"
          className="h-8 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-violet-lavender to-brand-violet hover:opacity-90 text-primary-foreground"
        >
          {actionLabel || `Create ${sectionName}`}
        </Button>
      )}
    </div>
  );
}
