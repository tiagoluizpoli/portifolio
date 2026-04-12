/**
 * Virtualized List — TanStack Virtual for large datasets
 *
 * Only renders items visible in the viewport + overscan buffer.
 * Essential for lists with 100+ items.
 */

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────
interface VirtualListItem {
  id: string
  title: string
  description: string
  status: 'active' | 'inactive' | 'pending'
}

interface VirtualListProps {
  items: VirtualListItem[]
  /** Container height in pixels */
  height?: number
  /** Estimated height of each row */
  estimateSize?: number
  /** Extra items to render above/below viewport */
  overscan?: number
  className?: string
  onItemClick?: (item: VirtualListItem) => void
}

// ─── Component ────────────────────────────────────────────────────
export function VirtualList({
  items,
  height = 600,
  estimateSize = 72,
  overscan = 5,
  className,
  onItemClick,
}: VirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  })

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto rounded-lg border', className)}
      style={{ height }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <button
                type="button"
                onClick={() => onItemClick?.(item)}
                className={cn(
                  'flex w-full items-center gap-4 border-b px-4 py-3',
                  'text-left transition-colors hover:bg-muted/50',
                  'focus-visible:outline-none focus-visible:bg-muted'
                )}
              >
                {/* Status indicator */}
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    item.status === 'active' && 'bg-emerald-500',
                    item.status === 'inactive' && 'bg-zinc-400',
                    item.status === 'pending' && 'bg-amber-500'
                  )}
                />
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>
                {/* Index (for debugging) */}
                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                  #{virtualRow.index + 1}
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Usage Example ────────────────────────────────────────────────
/**
 * const items = Array.from({ length: 10000 }, (_, i) => ({
 *   id: String(i),
 *   title: `Item ${i + 1}`,
 *   description: `Description for item ${i + 1}`,
 *   status: ['active', 'inactive', 'pending'][i % 3] as const,
 * }))
 *
 * <VirtualList
 *   items={items}
 *   height={500}
 *   onItemClick={(item) => console.log('Clicked:', item.id)}
 * />
 */
