/**
 * Controlled/Uncontrolled Pattern — Toggle Input
 *
 * This component works in both modes:
 * - Controlled: parent passes `checked` + `onCheckedChange`
 * - Uncontrolled: component manages its own state, parent reads via ref or `defaultChecked`
 */

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useCallback,
  useRef,
  useState,
} from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────
interface ToggleProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onChange'> {
  /** Controlled: current checked state */
  checked?: boolean
  /** Uncontrolled: initial checked state */
  defaultChecked?: boolean
  /** Callback when checked state changes (works in both modes) */
  onCheckedChange?: (checked: boolean) => void
  /** Label text */
  label?: string
}

// ─── Component ────────────────────────────────────────────────────
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      label,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    // Determine if controlled
    const isControlled = controlledChecked !== undefined
    const hasBeenControlled = useRef(isControlled)

    // Warn if switching between controlled/uncontrolled
    if (process.env.NODE_ENV === 'development') {
      if (hasBeenControlled.current && !isControlled) {
        console.warn('Toggle: Switching from controlled to uncontrolled. This is unsupported.')
      }
      if (!hasBeenControlled.current && isControlled) {
        console.warn('Toggle: Switching from uncontrolled to controlled. This is unsupported.')
      }
    }

    // Internal state for uncontrolled mode
    const [internalChecked, setInternalChecked] = useState(defaultChecked)

    // Resolve current value
    const isChecked = isControlled ? controlledChecked : internalChecked

    const handleToggle = useCallback(() => {
      if (disabled) return

      const nextValue = !isChecked

      // Update internal state only in uncontrolled mode
      if (!isControlled) {
        setInternalChecked(nextValue)
      }

      // Always fire callback (works in both modes)
      onCheckedChange?.(nextValue)
    }, [disabled, isChecked, isControlled, onCheckedChange])

    return (
      <div className="flex items-center gap-3">
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={isChecked}
          aria-label={label}
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
            'border-2 border-transparent transition-colors duration-200 ease-in-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isChecked ? 'bg-primary' : 'bg-input',
            className
          )}
          {...props}
        >
          <span
            aria-hidden
            className={cn(
              'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0',
              'transition-transform duration-200 ease-in-out',
              isChecked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
        {label && (
          <span className="text-sm font-medium leading-none">{label}</span>
        )}
      </div>
    )
  }
)
Toggle.displayName = 'Toggle'
