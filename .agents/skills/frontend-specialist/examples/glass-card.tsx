/**
 * Glass Card — Glassmorphism + noise texture + border glow + hover lift
 */

import { motion } from 'framer-motion'
import { type ComponentPropsWithoutRef, forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
  glow?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ glow = false, className, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 200, damping: 20 } }}
      className={cn(
        'relative rounded-2xl p-6',
        // Glassmorphism base
        'bg-card/60 backdrop-blur-xl',
        'border border-white/10',
        // Shadow
        'shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
        'hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]',
        // Transition
        'transition-shadow duration-300',
        // Glow effect (optional)
        glow && 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:pointer-events-none',
        className
      )}
      {...props}
    >
      {/* Noise texture overlay (subtle grain) */}
      <div
        className="absolute inset-0 rounded-2xl opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
)
GlassCard.displayName = 'GlassCard'
