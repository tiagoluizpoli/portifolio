# Performance Review — React, Data & Bundle Patterns

---

## Category 1: React Rendering Performance

### 1.1 Unnecessary Re-renders

The most common React performance issue. A component re-renders when its props or state change — but also when its parent re-renders, even if nothing relevant changed.

**Detection:**
```bash
# Look for components without memo on shared/list components
grep -n "const.*=.*({" src/components --include="*.tsx" -r | \
  grep -v "React.memo\|export default" | head -30
```

**Patterns to flag:**

```tsx
// ❌ RE-RENDER ISSUE: Parent re-renders force all children to re-render
const Parent = () => {
  const [count, setCount] = useState(0);
  return (
    <>
      <ExpensiveChart data={staticData} />  {/* Re-renders every time count changes */}
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </>
  );
};

// ✅ CORRECT: Memoize the component or lift static data
const MemoizedChart = React.memo(ExpensiveChart);
// Or: Move ExpensiveChart outside Parent's render scope via composition
```

### 1.2 Unstable References Causing Downstream Re-renders

```tsx
// ❌ ISSUE: New object created on every render → child always re-renders
const Parent = () => {
  const config = { theme: 'dark', lang: 'en' }; // New ref every render
  return <Child config={config} />;
};

// ✅ CORRECT: Stable reference
const DEFAULT_CONFIG = { theme: 'dark', lang: 'en' } as const;
const Parent = () => <Child config={DEFAULT_CONFIG} />;

// ❌ ISSUE: Inline function re-created every render
<button onClick={() => handleAction(id)}>Click</button>

// ✅ CORRECT: useCallback for stable callback
const onAction = useCallback(() => handleAction(id), [id]);
<button onClick={onAction}>Click</button>
```

### 1.3 Expensive Computations Not Memoized

```tsx
// ❌ ISSUE: Expensive computation runs on every render
const Dashboard = ({ data }: Props) => {
  const metrics = computeExpensiveMetrics(data); // Runs every render!
  return <MetricsGrid metrics={metrics} />;
};

// ✅ CORRECT: Memoize expensive computations
const Dashboard = ({ data }: Props) => {
  const metrics = useMemo(() => computeExpensiveMetrics(data), [data]);
  return <MetricsGrid metrics={metrics} />;
};
```

### 1.4 useEffect Dependency Issues

```tsx
// ❌ ISSUE: Missing dependency — stale closure
const [userId, setUserId] = useState('');
useEffect(() => {
  fetchUserData(userId); // userId may be stale
}, []); // userId missing from deps

// ❌ ISSUE: Object/function in deps — infinite loop
useEffect(() => {
  doSomething();
}, [options]); // options = {} or a function → new ref every render → infinite loop

// ✅ CORRECT: Primitive values in deps, or memoize complex values
const optionValues = useMemo(() => options, [options.key1, options.key2]);
useEffect(() => {
  doSomething(optionValues);
}, [optionValues]);
```

### 1.5 Large Lists Without Virtualization

```tsx
// ❌ ISSUE: Rendering 1000+ items in the DOM
{items.map(item => <ItemCard key={item.id} {...item} />)}

// ✅ CORRECT: Virtualize with @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual';
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80, // estimated item height
});
// Only renders visible items
```

---

## Category 2: Data Fetching Performance

### 2.1 N+1 Query Pattern

```typescript
// ❌ ISSUE: Fetching items, then fetching details for each item (N+1)
const skills = await databases.listDocuments(DB_ID, SKILLS_ID);
const skillsWithMeta = await Promise.all(
  skills.documents.map(skill => 
    databases.getDocument(DB_ID, META_ID, skill.metaId) // N queries!
  )
);

// ✅ CORRECT: Use relations or batch queries
// Option 1: Appwrite relationships (define in schema)
// Option 2: Single query with joined attributes
// Option 3: Batch by IDs if API supports it
```

### 2.2 Missing Query Caching / staleTime

```typescript
// ❌ ISSUE: Query refetches on every mount/focus change
const { data } = useQuery({
  queryKey: ['skills'],
  queryFn: fetchSkills,
  // No staleTime — defaults to 0 → refetches immediately on every focus
});

// ✅ CORRECT: Configure staleness appropriately
const { data } = useQuery({
  queryKey: ['skills'],
  queryFn: fetchSkills,
  staleTime: 5 * 60 * 1000, // 5 minutes — don't refetch if data is fresh
});
```

### 2.3 Over-Fetching

```typescript
// ❌ ISSUE: Fetching all fields when only a subset is needed
const { data } = useQuery({
  queryKey: ['skills'],
  queryFn: () => databases.listDocuments(DB_ID, SKILLS_ID),
  // Returns all fields including heavy blobs
});

// ✅ CORRECT: Select only needed fields
const { data } = useQuery({
  queryKey: ['skills-list'],
  queryFn: () => databases.listDocuments(DB_ID, SKILLS_ID, [
    Query.select(['name', 'category', 'level', '$id']),
  ]),
});
```

### 2.4 Missing Pagination

```typescript
// ❌ ISSUE: Fetching all documents (Appwrite caps at 100 by default, but intent matters)
const skills = await databases.listDocuments(DB_ID, SKILLS_ID);

// ✅ CORRECT: Explicit limit/offset or cursor-based pagination
const skills = await databases.listDocuments(DB_ID, SKILLS_ID, [
  Query.limit(20),
  Query.offset(page * 20),
  Query.orderDesc('$createdAt'),
]);
```

---

## Category 3: Bundle Performance

### 3.1 Un-tree-shaken Imports

```typescript
// ❌ ISSUE: Imports entire library (lodash = ~70kb gzipped)
import _ from 'lodash';
const result = _.debounce(fn, 300);

// ✅ CORRECT: Import only what's needed (with lodash-es for tree-shaking)
import { debounce } from 'lodash-es';
const result = debounce(fn, 300);

// ❌ ISSUE: Barrel imports from large packages
import { Button, Input, Dialog, Sheet, Command, Calendar } from '@/components/ui';
// If not using tree-shaking properly, this imports everything

// ✅ CORRECT: Direct imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
```

### 3.2 Missing Code Splitting

```tsx
// ❌ ISSUE: Heavy component imported eagerly in main bundle
import { DataVisualizationDashboard } from './charts';
// Immediately loads charting library even if user never visits this page

// ✅ CORRECT: Lazy loading with Suspense
const DataVisualizationDashboard = lazy(() =>
  import('./charts').then(m => ({ default: m.DataVisualizationDashboard }))
);

const Page = () => (
  <Suspense fallback={<DashboardSkeleton />}>
    <DataVisualizationDashboard />
  </Suspense>
);
```

### 3.3 Unoptimized Images

```tsx
// ❌ ISSUE: No lazy loading, no size constraints
<img src={imageUrl} />

// ✅ CORRECT: Lazy loading, explicit dimensions, WebP format
<img
  src={imageUrl}
  alt="Description"
  width={400}
  height={300}
  loading="lazy"
  decoding="async"
/>
```

### 3.4 CSS Animation Using Layout-Triggering Properties

```css
/* ❌ ISSUE: Animating layout properties causes expensive reflows */
@keyframes slide {
  from { margin-left: -100%; }  /* margin triggers layout */
  to   { margin-left: 0; }
}

/* ❌ ISSUE: Animating top/left (also triggers layout) */
@keyframes move {
  from { top: 0; }
  to   { top: 100px; }
}

/* ✅ CORRECT: Animate transform and opacity only (compositor-only) */
@keyframes slide {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}
```

---

## Performance Metrics Reference

| Metric | Target | What It Measures |
|:---|:---|:---|
| **FCP** | < 1.8s | First Contentful Paint — first meaningful content |
| **LCP** | < 2.5s | Largest Contentful Paint — main content loaded |
| **CLS** | < 0.1 | Cumulative Layout Shift — visual stability |
| **FID/INP** | < 200ms | Interaction to Next Paint — responsiveness |
| **TTI** | < 3.8s | Time to Interactive — fully usable |

**Layout Shift Causes (CLS):**
- Images without `width`/`height`
- Dynamically injected content above existing content
- Web fonts causing FOIT/FOUT

**Performance Budget Scanner:**
```bash
# Check for large source files that might bloat bundle
find src -name "*.tsx" -o -name "*.ts" | \
  while read f; do
    lines=$(wc -l < "$f")
    [ "$lines" -gt 200 ] && echo "Large: $f ($lines lines)"
  done

# Check for heavy unoptimized imports
grep -rn "import _ from 'lodash'" . --include="*.ts" --include="*.tsx" | \
  grep -v node_modules | sed 's/^/⚠️  /'
```
