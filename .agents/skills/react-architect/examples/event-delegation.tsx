/**
 * Event Delegation Pattern
 *
 * Instead of attaching event handlers to every item in a large list,
 * attach a single handler to the parent and use event bubbling + data attributes.
 *
 * This is critical for lists with 100+ interactive items where attaching
 * individual handlers would create memory pressure.
 */

import { type ReactNode, useCallback } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────
interface Action {
  id: string
  label: string
  icon?: ReactNode
  variant?: 'default' | 'destructive'
}

interface ListItem {
  id: string
  title: string
  description: string
}

interface DelegatedListProps {
  items: ListItem[]
  actions: Action[]
  onAction: (actionId: string, itemId: string) => void
  className?: string
}

// ─── Component ────────────────────────────────────────────────────
/**
 * A list component that uses event delegation for action buttons.
 *
 * Instead of:
 *   {items.map(item => (
 *     <button onClick={() => onEdit(item.id)}>Edit</button>    // N listeners
 *     <button onClick={() => onDelete(item.id)}>Delete</button> // N listeners
 *   ))}
 *
 * We use:
 *   ONE listener on the parent, decoding action + item from data attributes.
 */
export function DelegatedList({
  items,
  actions,
  onAction,
  className,
}: DelegatedListProps) {
  // Single event handler for ALL actions on ALL items
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Walk up the DOM to find the closest action button
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        '[data-action]'
      )
      if (!target) return

      const actionId = target.dataset.action
      const itemId = target.dataset.itemId

      if (actionId && itemId) {
        onAction(actionId, itemId)
      }
    },
    [onAction]
  )

  return (
    // Single click handler on the container — delegated to all children
    <div
      className={cn('divide-y rounded-lg border', className)}
      onClick={handleClick}
      role="list"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between px-4 py-3"
          role="listitem"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {item.description}
            </p>
          </div>
          <div className="flex gap-1 ml-4">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                // Data attributes carry the action context — no individual handler needed
                data-action={action.id}
                data-item-id={item.id}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2 py-1',
                  'text-xs font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  action.variant === 'destructive'
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Usage Example ────────────────────────────────────────────────
/**
 * const actions: Action[] = [
 *   { id: 'edit', label: 'Edit' },
 *   { id: 'duplicate', label: 'Clone' },
 *   { id: 'delete', label: 'Delete', variant: 'destructive' },
 * ]
 *
 * <DelegatedList
 *   items={users}
 *   actions={actions}
 *   onAction={(actionId, itemId) => {
 *     switch (actionId) {
 *       case 'edit': openEditDialog(itemId); break
 *       case 'duplicate': duplicateItem(itemId); break
 *       case 'delete': deleteItem(itemId); break
 *     }
 *   }}
 * />
 *
 * Result: 1 event listener instead of items.length * actions.length listeners.
 * For 1000 items with 3 actions, that's 1 vs 3000 listeners.
 */
