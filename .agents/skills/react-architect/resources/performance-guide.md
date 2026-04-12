# Performance Guide — Strategic Optimization

Performance optimization in React is about doing LESS work, not doing work FASTER. This guide covers every technique, when to apply it, and when NOT to.

---

## Golden Rule: Measure Before Optimizing

Never optimize based on intuition. Use React DevTools Profiler, Chrome DevTools Performance tab, or `console.time()` to identify actual bottlenecks.

```tsx
// Quick measurement
console.time('filterItems')
const filtered = items.filter(item => item.matches(query))
console.timeEnd('filterItems')
// If this logs < 1ms, don't optimize it.
```

---

## 1. React.memo

**What**: Wraps a component to skip re-renders when its props haven't changed (shallow comparison).

```tsx
// ✅ Memoize components that receive stable primitive props from frequently-updating parents
export const ExpensiveChart = memo(function ExpensiveChart({ data, width, height }: ChartProps) {
  // Heavy rendering logic...
  return <canvas />
})

// ✅ Custom comparison for complex props
export const UserCard = memo(
  function UserCard({ user }: { user: User }) {
    return <div>{user.name}</div>
  },
  (prev, next) => prev.user.id === next.user.id && prev.user.updatedAt === next.user.updatedAt
)
```

**When to Use**:
- Component renders costly UI (charts, large lists, complex SVGs)
- Component's parent re-renders frequently but the component's props rarely change
- Component is used in a list and most items don't change when the list updates

**When NOT to Use**:
- Component receives `children` (almost always a new reference)
- Component's props change on every render anyway
- Component is cheap to render (< 1ms)
- Component already re-renders infrequently

---

## 2. Suspense Boundaries

**What**: Declarative loading states for async operations (data fetching, code splitting, lazy loading).

```tsx
<Suspense fallback={<DashboardSkeleton />}>
  <Dashboard />          {/* This component uses `use()` or a suspense-enabled library */}
</Suspense>
```

**Architecture**: Strategy for placing Suspense boundaries:

```
<App>
  <Suspense fallback={<AppShell />}>              ← Page-level skeleton
    <Layout>
      <Suspense fallback={<SidebarSkeleton />}>   ← Section-level
        <Sidebar />
      </Suspense>
      <main>
        <Suspense fallback={<ContentSkeleton />}>  ← Content-level
          <PageContent />
        </Suspense>
      </main>
    </Layout>
  </Suspense>
</App>
```

**Rules**:
- Place Suspense boundaries at meaningful UI boundaries (not around every component)
- Skeleton loaders MUST match the layout dimensions of the loaded content (no layout shift)
- Nest Suspense boundaries to enable progressive loading (shell → sidebar → content)
- Always pair with ErrorBoundary for error states

---

## 3. Code Splitting (React.lazy)

**What**: Split your bundle into chunks that load on demand.

```tsx
// ✅ Lazy load route-level components
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'))
const Settings = lazy(() => import('./features/settings/Settings'))

// ✅ Lazy load heavy components (charts, editors, maps)
const MarkdownEditor = lazy(() => import('./components/MarkdownEditor'))

// ✅ Preload on hover/focus for perceived performance
function NavLink({ to, children }: NavLinkProps) {
  const preload = () => {
    if (to === '/dashboard') import('./features/dashboard/Dashboard')
    if (to === '/settings') import('./features/settings/Settings')
  }
  return (
    <Link to={to} onMouseEnter={preload} onFocus={preload}>
      {children}
    </Link>
  )
}
```

**What to Split**:
- Route-level components (always)
- Heavy third-party libraries (chart libraries, rich text editors, PDF viewers)
- Components behind user interaction (dialogs, drawers, command palettes)
- Admin-only features (most users never see them)

**What NOT to Split**:
- Small components (< 5KB)
- Components visible on initial render (above the fold)
- Components used everywhere (Button, Input)

---

## 4. Virtualization

**What**: Only render items that are visible in the viewport. Essential for lists with 100+ items.

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Estimated row height in px
    overscan: 5,            // Render 5 extra items above/below viewport
  })

  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ItemRow item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**When to Virtualize**:
- Lists with 100+ items
- Tables with 50+ rows
- Grids with 50+ cells
- Any scrollable area with many DOM nodes

**When NOT to Virtualize**:
- Lists with < 50 items (DOM is fast enough)
- Items with variable height that can't be estimated
- Lists that need to be fully searchable by browser (Ctrl+F)

---

## 5. Transitions (useTransition / useDeferredValue)

**What**: Mark state updates as non-urgent so urgent updates (typing, clicking) remain responsive.

```tsx
// Pattern: Search with large result set
function SearchPage() {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)                          // Urgent: input stays responsive
    startTransition(() => {
      setSearchResults(filterLargeDataset(e.target.value)) // Non-urgent: can lag
    })
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      <div style={{ opacity: isPending ? 0.7 : 1 }}>
        <SearchResults results={searchResults} />
      </div>
    </>
  )
}
```

---

## 6. Avoiding Unnecessary Re-renders

### Pattern: Lift Content Up
```tsx
// ❌ Bad: Every child re-renders when count changes
function Page() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <Counter count={count} onChange={setCount} />
      <ExpensiveTree />  {/* Re-renders on every count change! */}
    </div>
  )
}

// ✅ Good: Push state down to isolate re-renders
function Page() {
  return (
    <div>
      <CounterSection />   {/* State lives here */}
      <ExpensiveTree />     {/* Never re-renders */}
    </div>
  )
}

function CounterSection() {
  const [count, setCount] = useState(0)
  return <Counter count={count} onChange={setCount} />
}
```

### Pattern: Children as Props (Component Composition)
```tsx
// ✅ Children don't re-render when ScrollTracker's state changes
function ScrollTracker({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])
  return (
    <div>
      <ScrollIndicator y={scrollY} />
      {children}  {/* Same reference — doesn't re-render */}
    </div>
  )
}
```

---

## 7. Image Optimization

```tsx
// ✅ Lazy loading with native browser support
<img src={src} alt={alt} loading="lazy" decoding="async" />

// ✅ Responsive images with srcset
<img
  src={src}
  srcSet={`${src}?w=400 400w, ${src}?w=800 800w, ${src}?w=1200 1200w`}
  sizes="(max-width: 768px) 100vw, 50vw"
  alt={alt}
  loading="lazy"
/>

// ✅ Preload critical images
<link rel="preload" as="image" href="/hero-image.webp" />
```

---

## 8. CSS-First Animations

**Rule**: Always prefer CSS animations over JavaScript animations. They run on the compositor thread and don't block the main thread.

```css
/* ✅ Hardware-accelerated (compositor thread) */
.animate-entry {
  animation: slideIn 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);  /* Only transform + opacity */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ❌ NOT hardware-accelerated (main thread — causes jank) */
@keyframes badSlideIn {
  from {
    top: 8px;       /* Triggers layout recalculation */
    height: 0;      /* Triggers layout recalculation */
  }
}
```

**Animatable properties that are cheap** (compositor only):
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (blur, brightness — with caution)

**Animatable properties that are expensive** (trigger layout):
- `width`, `height`, `top`, `left`, `right`, `bottom`
- `margin`, `padding`
- `font-size`, `line-height`
