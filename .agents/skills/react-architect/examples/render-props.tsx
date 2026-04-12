/**
 * Render Props Pattern — Mouse Tracker
 *
 * The component manages the logic (tracking mouse position).
 * The consumer controls what gets rendered via the `children` render prop.
 *
 * Usage:
 * <MouseTracker>
 *   {({ x, y, isInside }) => (
 *     <div>Cursor at ({x}, {y})</div>
 *   )}
 * </MouseTracker>
 */

import { type ReactNode, useCallback, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────
interface MouseState {
  x: number
  y: number
  isInside: boolean
}

interface MouseTrackerProps {
  /** Render prop — receives mouse state, returns JSX */
  children: (state: MouseState) => ReactNode
  className?: string
}

// ─── Component ────────────────────────────────────────────────────
export function MouseTracker({ children, className }: MouseTrackerProps) {
  const [state, setState] = useState<MouseState>({ x: 0, y: 0, isInside: false })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setState({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
      isInside: true,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setState(prev => ({ ...prev, isInside: false }))
  }, [])

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children(state)}
    </div>
  )
}

// ─── Alternative: Render Prop via named prop ──────────────────────
/**
 * Sometimes a named render prop is clearer than children.
 *
 * Usage:
 * <DataRenderer
 *   source={() => fetchUsers()}
 *   render={(users) => <UserList users={users} />}
 *   fallback={<Skeleton />}
 *   error={(err) => <ErrorMessage error={err} />}
 * />
 */

interface DataRendererProps<T> {
  source: () => Promise<T>
  render: (data: T) => ReactNode
  fallback: ReactNode
  error: (err: Error) => ReactNode
}

// This is the TYPE SIGNATURE — implementation would use Suspense/use() in React 19
export type { DataRendererProps }
