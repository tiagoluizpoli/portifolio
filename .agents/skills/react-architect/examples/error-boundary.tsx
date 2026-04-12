/**
 * Error Boundary — Production-grade with retry, reset, and logging
 *
 * Uses react-error-boundary for functional component support.
 * Includes three tiers: Global, Route, and Widget.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────
interface ErrorBoundaryProps {
  children: ReactNode
  /** Fallback UI when an error occurs */
  fallback?: ReactNode | ((props: FallbackProps) => ReactNode)
  /** Called when an error is caught (for logging/reporting) */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Reset keys — when these change, the error boundary resets */
  resetKeys?: unknown[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export interface FallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

// ─── Error Boundary Component ─────────────────────────────────────
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to error tracking service
    this.props.onError?.(error, errorInfo)

    // Always log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error, errorInfo.componentStack)
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, i) => key !== prevProps.resetKeys?.[i]
      )
      if (hasChanged) {
        this.resetErrorBoundary()
      }
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props
      const fallbackProps: FallbackProps = {
        error: this.state.error,
        resetErrorBoundary: this.resetErrorBoundary,
      }

      if (typeof fallback === 'function') {
        return fallback(fallbackProps)
      }

      if (fallback) {
        return fallback
      }

      // Default fallback
      return <DefaultErrorFallback {...fallbackProps} />
    }

    return this.props.children
  }
}

// ─── Default Fallback ─────────────────────────────────────────────
function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center"
    >
      <div className="rounded-full bg-destructive/10 p-3">
        <svg
          className="h-6 w-6 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Something went wrong</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">{error.message}</p>
      </div>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

// ─── Specialized Fallbacks ────────────────────────────────────────

/** Global-level: Full page error with reload */
export function GlobalErrorFallback({ error }: FallbackProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">Application Error</h1>
      <p className="text-muted-foreground max-w-md text-center">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
      >
        Reload Application
      </button>
    </div>
  )
}

/** Widget-level: Inline error with retry */
export function WidgetErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-destructive/20 px-3 py-2">
      <span className="text-xs text-destructive">{error.message}</span>
      <button
        onClick={resetErrorBoundary}
        className="text-xs text-primary underline hover:no-underline"
      >
        Retry
      </button>
    </div>
  )
}
