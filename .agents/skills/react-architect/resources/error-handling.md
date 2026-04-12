# Error Handling — Resilient React Applications

Every application will encounter errors. The difference between amateur and professional is how those errors are handled, reported, and recovered from.

---

## Error Boundary Architecture

Error Boundaries catch errors during rendering, lifecycle methods, and constructors of their child tree.

### Placement Strategy

```
<App>
  <GlobalErrorBoundary>                    ← Catch-all: "Something went wrong"
    <AuthProvider>
      <Layout>
        <RouteErrorBoundary>               ← Route-level: "Page failed to load"
          <Suspense fallback={<Skeleton />}>
            <WidgetErrorBoundary>          ← Widget-level: "Widget failed"
              <MetricsChart />
            </WidgetErrorBoundary>
          </Suspense>
        </RouteErrorBoundary>
      </Layout>
    </AuthProvider>
  </GlobalErrorBoundary>
</App>
```

### Granularity Rules

1. **Global**: One at the root. Shows a full-page error with "Reload" button.
2. **Route**: One per route/page. Shows "This page couldn't load" with navigation back.
3. **Widget**: One per independent data-fetching widget. Shows inline error with "Retry".
4. **Never**: Don't wrap every single component. That's overkill.

---

## What Error Boundaries Catch vs. Don't Catch

| ✅ Caught | ❌ NOT Caught |
|:---|:---|
| Errors during rendering | Event handler errors |
| Errors in lifecycle methods | Async errors (setTimeout, fetch) |
| Errors in constructors | Server-side rendering errors |
| Errors thrown by `use()` | Errors in the error boundary itself |

### Handling Event Handler Errors

```tsx
// ✅ Try/catch in event handlers
async function handleSubmit() {
  try {
    await api.submitForm(data)
    toast.success('Saved!')
  } catch (err) {
    if (err instanceof ValidationError) {
      form.setError('root', { message: err.message })
    } else {
      toast.error('Something went wrong. Please try again.')
      reportError(err) // Log to Sentry/etc.
    }
  }
}
```

### Handling Async Errors

```tsx
// ✅ Global unhandled rejection handler
useEffect(() => {
  const handler = (event: PromiseRejectionEvent) => {
    event.preventDefault()
    reportError(event.reason)
    toast.error('An unexpected error occurred')
  }
  window.addEventListener('unhandledrejection', handler)
  return () => window.removeEventListener('unhandledrejection', handler)
}, [])
```

---

## Recovery Patterns

### 1. Retry with Reset

```tsx
function WidgetErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="rounded-lg border border-destructive/50 p-4">
      <p className="text-sm text-destructive">Failed to load widget</p>
      <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-3 text-xs underline hover:no-underline"
      >
        Try again
      </button>
    </div>
  )
}
```

### 2. Navigate Away

```tsx
function PageErrorFallback({ error }: FallbackProps) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-lg font-semibold">Page Error</h2>
      <p className="text-muted-foreground mt-2">{error.message}</p>
      <button onClick={() => navigate(-1)} className="mt-4">
        Go Back
      </button>
    </div>
  )
}
```

### 3. Graceful Degradation

```tsx
function MetricsSection() {
  return (
    <ErrorBoundary fallback={<MetricsFallback />}>
      <Suspense fallback={<MetricsSkeleton />}>
        <LiveMetrics />
      </Suspense>
    </ErrorBoundary>
  )
}

function MetricsFallback() {
  return (
    <div className="opacity-60">
      <p>Live metrics temporarily unavailable</p>
      <p className="text-xs">Last updated: {formatRelativeTime(lastKnownUpdate)}</p>
      {/* Show cached/stale data instead of nothing */}
    </div>
  )
}
```

---

## Error Reporting

```tsx
function reportError(error: unknown, context?: Record<string, unknown>) {
  // 1. Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[App Error]', error, context)
  }

  // 2. Send to error tracking service
  // Sentry.captureException(error, { extra: context })

  // 3. Include useful context
  const errorReport = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...context,
  }

  // 4. Send to your error endpoint
  navigator.sendBeacon('/api/errors', JSON.stringify(errorReport))
}
```
