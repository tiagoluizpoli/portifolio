/**
 * Notification Toast — Stacked with stagger dismiss and progress bar
 */

import { AnimatePresence, motion } from 'framer-motion'
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────
type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

// ─── Context ──────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

// ─── Provider ─────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    const duration = toast.duration ?? 5000
    setToasts(prev => [...prev, { ...toast, id, duration }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

// ─── Toast Container ──────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[500] flex flex-col-reverse gap-2 w-80">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Toast Item ───────────────────────────────────────────────────
const variantStyles: Record<ToastVariant, { bg: string; icon: string; bar: string }> = {
  success: { bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800', icon: '✓', bar: 'bg-emerald-500' },
  error: { bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800', icon: '✕', bar: 'bg-red-500' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800', icon: '⚠', bar: 'bg-amber-500' },
  info: { bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800', icon: 'ℹ', bar: 'bg-blue-500' },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const styles = variantStyles[toast.variant]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={cn(
        'relative overflow-hidden rounded-xl border shadow-lg',
        styles.bg
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="text-sm mt-0.5">{styles.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          ✕
        </button>
      </div>
      {/* Progress bar (auto-dismiss timer) */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (toast.duration ?? 5000) / 1000, ease: 'linear' }}
        className={cn('h-0.5', styles.bar)}
      />
    </motion.div>
  )
}
