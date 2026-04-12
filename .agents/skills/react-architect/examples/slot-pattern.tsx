/**
 * Slot Pattern — Radix-style `asChild` composition
 *
 * A Slot component merges its own props onto its single child element,
 * allowing consumers to control the rendered tag while Slot injects behavior.
 *
 * Usage:
 * // Renders as <a> with Button's className + onClick behavior
 * <Button asChild>
 *   <a href="/login">Log In</a>
 * </Button>
 */

import {
  Children,
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

// ─── Slot Core ────────────────────────────────────────────────────

interface SlotProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
}

/**
 * Merges its own props onto its single child element.
 * - ClassNames are concatenated (using cn)
 * - Event handlers are composed (both fire)
 * - Styles are merged (child wins on conflict)
 * - Refs are forwarded to the child
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(
  ({ children, ...slotProps }, forwardedRef) => {
    const child = Children.only(children)

    if (!isValidElement(child)) {
      throw new Error(
        'Slot expects a single valid React element as its child. ' +
          `Received: ${typeof child}`
      )
    }

    const childProps = child.props as Record<string, unknown>

    // Merge props
    const mergedProps: Record<string, unknown> = { ...slotProps }

    for (const key of Object.keys(childProps)) {
      if (key === 'className') {
        // Concatenate classNames
        mergedProps.className = cn(
          slotProps.className as string,
          childProps.className as string
        )
      } else if (key === 'style') {
        // Merge styles (child wins)
        mergedProps.style = {
          ...(slotProps.style || {}),
          ...(childProps.style as object || {}),
        }
      } else if (key.startsWith('on') && typeof childProps[key] === 'function') {
        // Compose event handlers (both fire)
        const slotHandler = (slotProps as Record<string, unknown>)[key]
        const childHandler = childProps[key]
        if (typeof slotHandler === 'function') {
          mergedProps[key] = (...args: unknown[]) => {
            ;(childHandler as Function)(...args)
            ;(slotHandler as Function)(...args)
          }
        } else {
          mergedProps[key] = childHandler
        }
      } else if (!(key in slotProps)) {
        // Child props win for non-conflicting keys
        mergedProps[key] = childProps[key]
      }
    }

    // Forward ref
    mergedProps.ref = forwardedRef

    return cloneElement(child, mergedProps)
  }
)
Slot.displayName = 'Slot'

// ─── Usage with Button ────────────────────────────────────────────

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  asChild?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

/**
 * Button that supports `asChild` for Slot composition.
 *
 * @example
 * // Regular button
 * <Button variant="primary" onClick={handleClick}>Click</Button>
 *
 * // Render as anchor (Slot pattern)
 * <Button variant="primary" asChild>
 *   <a href="/dashboard">Go to Dashboard</a>
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, variant = 'primary', className, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center rounded-lg px-4 py-2',
      'text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
      variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
      className
    )

    if (asChild) {
      return (
        <Slot ref={ref as React.Ref<HTMLElement>} className={classes} {...props}>
          {children}
        </Slot>
      )
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
