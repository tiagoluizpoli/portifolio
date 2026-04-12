/**
 * Tooltip Micro — Spring-animated tooltip with smart positioning
 */

import { AnimatePresence, motion } from 'framer-motion'
import { forwardRef, type ReactNode, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  children: ReactNode
  delayMs?: number
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
} as const

const arrowStyles = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-900 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-900 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-900 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-900 border-y-transparent border-l-transparent',
} as const

const motionOrigins = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, side = 'top', children, delayMs = 200 }, ref) => {
    const [isVisible, setIsVisible] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const show = () => {
      timeoutRef.current = setTimeout(() => setIsVisible(true), delayMs)
    }

    const hide = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setIsVisible(false)
    }

    return (
      <div
        ref={ref}
        className="relative inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
        <AnimatePresence>
          {isVisible && (
            <motion.div
              role="tooltip"
              initial={{ opacity: 0, scale: 0.95, ...motionOrigins[side] }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
              className={cn(
                'absolute z-[600] whitespace-nowrap pointer-events-none',
                'rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-50',
                'shadow-md',
                positionStyles[side]
              )}
            >
              {content}
              {/* Arrow */}
              <span
                className={cn(
                  'absolute border-4',
                  arrowStyles[side]
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
Tooltip.displayName = 'Tooltip'
