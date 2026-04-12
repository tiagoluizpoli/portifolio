/**
 * Skeleton Loader — Layout-matched with shimmer animation
 */
import { cn } from '@/lib/utils'

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-md',
        'bg-gradient-to-r from-muted via-muted-foreground/10 to-muted',
        'bg-[length:200%_100%]',
        className
      )}
    />
  )
}

/** Matches a user profile card layout */
export function ProfileCardSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-2xl border bg-card p-6">
      <Shimmer className="h-14 w-14 rounded-full shrink-0" />
      <div className="flex-1 space-y-3">
        <Shimmer className="h-4 w-36" />
        <Shimmer className="h-3 w-24" />
        <div className="space-y-2 pt-1">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  )
}

/** Matches a metrics dashboard grid */
export function MetricGridSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className={cn('grid gap-4', `grid-cols-${columns}`)}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex justify-between">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-4 w-4 rounded" />
          </div>
          <Shimmer className="h-8 w-28" />
          <Shimmer className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

/** Matches a data table layout */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 bg-muted/30 border-b">
        <Shimmer className="h-3 w-8" />
        <Shimmer className="h-3 w-32 flex-1" />
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-3 w-16" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center px-4 py-3 border-b last:border-0">
          <Shimmer className="h-3 w-8" />
          <Shimmer className="h-3 w-40 flex-1" />
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-5 w-16 rounded-full" />
          <Shimmer className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  )
}

/**
 * Add this to your CSS:
 *
 * @keyframes shimmer {
 *   0% { background-position: 200% 0; }
 *   100% { background-position: -200% 0; }
 * }
 * .animate-shimmer {
 *   animation: shimmer 1.5s ease-in-out infinite;
 * }
 */
