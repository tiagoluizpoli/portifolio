/**
 * Code Splitting — React.lazy with Suspense and Preloading
 *
 * Pattern for lazy-loading heavy components and preloading on interaction.
 */

import { lazy, Suspense, useCallback, useState } from 'react'
import { Skeleton } from './suspense-loading'
import { cn } from '@/lib/utils'

// ─── 1. Basic Lazy Loading ────────────────────────────────────────

// Heavy components that should be code-split:
const MarkdownEditor = lazy(() => import('@/components/MarkdownEditor'))
const PdfViewer = lazy(() => import('@/components/PdfViewer'))
const ChartDashboard = lazy(() => import('@/features/analytics/ChartDashboard'))

// ─── 2. Preloading Strategy ──────────────────────────────────────

/**
 * Cache the import promise so preloading only triggers once.
 * This is the pattern for preloading on hover/focus.
 */
const componentLoaders = {
  markdownEditor: () => import('@/components/MarkdownEditor'),
  pdfViewer: () => import('@/components/PdfViewer'),
  chartDashboard: () => import('@/features/analytics/ChartDashboard'),
} as const

const preloadCache = new Set<string>()

function preloadComponent(key: keyof typeof componentLoaders) {
  if (preloadCache.has(key)) return
  preloadCache.add(key)
  componentLoaders[key]()
}

// ─── 3. Usage Component ──────────────────────────────────────────

type ActiveView = 'editor' | 'pdf' | 'chart' | null

export function ContentViewer() {
  const [activeView, setActiveView] = useState<ActiveView>(null)

  const handleViewChange = useCallback((view: ActiveView) => {
    setActiveView(view)
  }, [])

  return (
    <div className="space-y-4">
      {/* Navigation with preloading on hover */}
      <nav className="flex gap-2">
        <button
          type="button"
          onMouseEnter={() => preloadComponent('markdownEditor')}
          onFocus={() => preloadComponent('markdownEditor')}
          onClick={() => handleViewChange('editor')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            activeView === 'editor'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Markdown Editor
        </button>
        <button
          type="button"
          onMouseEnter={() => preloadComponent('pdfViewer')}
          onFocus={() => preloadComponent('pdfViewer')}
          onClick={() => handleViewChange('pdf')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            activeView === 'pdf'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          PDF Viewer
        </button>
        <button
          type="button"
          onMouseEnter={() => preloadComponent('chartDashboard')}
          onFocus={() => preloadComponent('chartDashboard')}
          onClick={() => handleViewChange('chart')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            activeView === 'chart'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Analytics
        </button>
      </nav>

      {/* Content area with Suspense per view */}
      <div className="min-h-[400px] rounded-xl border">
        {activeView === 'editor' && (
          <Suspense fallback={<EditorSkeleton />}>
            <MarkdownEditor />
          </Suspense>
        )}
        {activeView === 'pdf' && (
          <Suspense fallback={<ViewerSkeleton />}>
            <PdfViewer />
          </Suspense>
        )}
        {activeView === 'chart' && (
          <Suspense fallback={<ChartSkeleton />}>
            <ChartDashboard />
          </Suspense>
        )}
        {!activeView && (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground text-sm">
            Select a view to get started
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Layout-Matched Skeletons ─────────────────────────────────────

function EditorSkeleton() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
      <Skeleton className="h-[340px] w-full rounded-lg" />
    </div>
  )
}

function ViewerSkeleton() {
  return <Skeleton className="h-[400px] w-full" />
}

function ChartSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[240px] rounded-lg" />
    </div>
  )
}
