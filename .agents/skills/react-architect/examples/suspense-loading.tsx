/**
 * Suspense + Skeleton Pattern
 *
 * Layout-matched skeleton loaders that prevent content layout shift (CLS).
 * Each skeleton mirrors the exact dimensions of the loaded content.
 */

import { type ReactNode, Suspense } from 'react'
import { ErrorBoundary, type FallbackProps } from './error-boundary'
import { cn } from '@/lib/utils'

// ─── Skeleton Primitives ──────────────────────────────────────────

interface SkeletonProps {
  className?: string
}

/** Base skeleton shimmer block */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  )
}

/** Text line skeleton — matches typical text heights */
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full' // Last line is shorter
          )}
        />
      ))}
    </div>
  )
}

/** Avatar skeleton */
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' }
  return <Skeleton className={cn('rounded-full', sizes[size])} />
}

// ─── Layout-Matched Skeletons ─────────────────────────────────────

/** Matches the UserProfile composite component layout exactly */
export function UserProfileSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-xl border bg-card p-6">
      <SkeletonAvatar size="lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />  {/* Name */}
        <Skeleton className="h-3 w-20" />  {/* Role */}
        <Skeleton className="h-3 w-full" /> {/* Bio line 1 */}
        <Skeleton className="h-3 w-2/3" />  {/* Bio line 2 */}
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-10" />  {/* Edit */}
        <Skeleton className="h-6 w-12" />  {/* Delete */}
      </div>
    </div>
  )
}

/** Matches a metrics card */
export function MetricsCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />  {/* Label */}
        <Skeleton className="h-4 w-4 rounded" />  {/* Icon */}
      </div>
      <Skeleton className="h-8 w-32" />  {/* Value */}
      <Skeleton className="h-3 w-20" />  {/* Trend */}
    </div>
  )
}

/** Dashboard grid skeleton */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      {/* Metrics grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricsCardSkeleton key={i} />
        ))}
      </div>
      {/* Content area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Async Boundary Helper ────────────────────────────────────────

interface AsyncBoundaryProps {
  children: ReactNode
  skeleton: ReactNode
  errorFallback?: (props: FallbackProps) => ReactNode
}

/**
 * Combines ErrorBoundary + Suspense into a single wrapper.
 * Always use this around data-fetching components.
 *
 * @example
 * <AsyncBoundary skeleton={<UserProfileSkeleton />}>
 *   <UserProfile userId={id} />
 * </AsyncBoundary>
 */
export function AsyncBoundary({
  children,
  skeleton,
  errorFallback,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={errorFallback || undefined}
      onError={(error, info) => {
        console.error('[AsyncBoundary]', error, info)
      }}
    >
      <Suspense fallback={skeleton}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}
