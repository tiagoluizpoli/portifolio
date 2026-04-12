/**
 * Staggered List — Cascade entrance with intersection observer trigger
 */

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface StaggeredListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  staggerDelay?: number
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
}

export function StaggeredList<T extends { id: string }>({
  items,
  renderItem,
  className,
}: StaggeredListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={cn('space-y-2', className)}
    >
      {items.map((item, index) => (
        <motion.div key={item.id} variants={itemVariants}>
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  )
}
