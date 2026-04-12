/**
 * Premium Button — Gradient + inner shadow + spring hover + loading state
 */

import { motion } from 'framer-motion'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface PremiumButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantStyles = {
  primary: [
    'bg-gradient-to-b from-primary to-primary/90',
    'text-primary-foreground',
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_1px_2px_0_rgba(0,0,0,0.1)]',
    'hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_8px_0_rgba(0,0,0,0.15)]',
  ].join(' '),
  secondary: [
    'bg-secondary text-secondary-foreground',
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
    'hover:bg-secondary/80',
  ].join(' '),
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
} as const

const sizeStyles = {
  sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
} as const

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        loading && 'pointer-events-none',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
)
PremiumButton.displayName = 'PremiumButton'
