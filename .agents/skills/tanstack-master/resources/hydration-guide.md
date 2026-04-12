# TanStack Hydration Guide — Zero Mismatch Reference

---

## What Is a Hydration Mismatch?

React renders HTML on the server (SSR), then the browser "hydrates" that HTML by attaching event listeners and making it interactive. A **hydration mismatch** occurs when the server-rendered HTML and the first client render produce different output. React throws a warning (or in strict mode, an error) and re-renders from scratch — causing a visible flash and performance hit.

**Common symptom**: Content flashes or jumps on first page load.

---

## Root Causes — Complete Catalog

### Cause 1: Browser-Only APIs

```tsx
// ❌ MISMATCH: localStorage doesn't exist on server
const theme = localStorage.getItem('theme') ?? 'dark'; // Server: throw ReferenceError

// ❌ MISMATCH: window / document
const width = window.innerWidth; // Server: throw ReferenceError

// ❌ MISMATCH: navigator
const isOnline = navigator.onLine; // Server: throw ReferenceError
```

```tsx
// ✅ FIX 1: useEffect (defers to client after hydration)
const [theme, setTheme] = useState('dark'); // Server: 'dark'
useEffect(() => {
  setTheme(localStorage.getItem('theme') ?? 'dark'); // Client: real value
}, []);

// ✅ FIX 2: clientOnly() wrapper (TanStack Start built-in)
import { clientOnly } from '@tanstack/react-router';
const ThemeSwitcher = clientOnly(() => {
  const [theme] = useState(() => localStorage.getItem('theme') ?? 'dark');
  return <Button>{theme}</Button>;
});
// Renders nothing on server, renders on client — no mismatch

// ✅ FIX 3: typeof window guard
const isClient = typeof window !== 'undefined';
const width = isClient ? window.innerWidth : 0; // Server: 0, client: real value
// Warning: this causes a mismatch if 0 ≠ real width — use useEffect instead
```

---

### Cause 2: Date/Time - Different Locales or Timing

```tsx
// ❌ MISMATCH: new Date() returns different values server vs client
const now = new Date().toLocaleString(); // Different locale on server vs browser

// ❌ MISMATCH: Date format depends on OS locale
const formatted = new Date().toLocaleDateString('en-US'); // OK but can still differ

// ✅ FIX 1: Render date only after mount
const [displayDate, setDisplayDate] = useState(''); // Server: empty string
useEffect(() => {
  setDisplayDate(new Date().toLocaleString()); // Client: real date
}, []);

// ✅ FIX 2: Use a stable ISO string (pass from server)
// In loader:
loader: () => ({ serverTime: new Date().toISOString() }), // Stable string

// In component:
const { serverTime } = Route.useLoaderData();
const formatted = new Intl.DateTimeFormat('en-US').format(new Date(serverTime)); // Same on both

// ✅ FIX 3: suppressHydrationWarning for intentionally dynamic values
<time suppressHydrationWarning dateTime={isoDate}>
  {new Date(isoDate).toLocaleString()} // Allowed to differ
</time>
```

---

### Cause 3: Random / Non-Deterministic IDs

```tsx
// ❌ MISMATCH: Math.random() produces different values server vs client
const id = `tooltip-${Math.random()}`;
<div id={id} aria-describedby={id} />

// ❌ MISMATCH: crypto.randomUUID() — different each render
const id = crypto.randomUUID();

// ✅ FIX 1: React useId() — stable, SSR-safe
import { useId } from 'react';
const id = useId(); // 'r0:', 'r1:', etc. — same on server and client

// ✅ FIX 2: Derive ID from stable props
const id = `tooltip-${props.fieldName}`; // Stable if fieldName is stable
```

---

### Cause 4: Conditional Rendering on Auth State

```tsx
// ❌ MISMATCH: Server has no session → renders "Login", client reads cookie → renders "Dashboard"
return isAuthenticated ? <Dashboard /> : <Login />;

// ✅ FIX: Use server-side auth check in loader — pass result as context
// loader:
loader: async ({ context }) => {
  try {
    const user = await context.account.get();
    return { user };
  } catch {
    return { user: null };
  }
},

// component:
function Page() {
  const { user } = Route.useLoaderData(); // Same value on server and client
  return user ? <Dashboard user={user} /> : <Login />;
}
```

---

### Cause 5: External Data That Changes Between Server and Client

```tsx
// ❌ MISMATCH: Data fetched independently on server and client produces different results
// Server fetches at T=0: { count: 42 }
// Client immediately re-fetches: { count: 43 } → mismatch

// ✅ FIX: Use TanStack Query hydration (loader populates cache, client reads cache)
// loader:
loader: ({ context: { queryClient } }) =>
  queryClient.ensureQueryData(itemsQueryOptions()), // Fetches on server

// component:
const { data } = useSuspenseQuery(itemsQueryOptions()); // Reads populated cache → same data
// No second fetch until staleTime expires
```

---

### Cause 6: CSS-in-JS or Dynamic Class Names

```tsx
// ❌ MISMATCH: Class names generated differently
const className = `btn-${Math.random().toString(36).slice(2)}`;

// ✅ FIX: Use static class names or deterministic generation
const className = cn('btn', variant === 'primary' && 'btn-primary'); // Static strings
```

---

### Cause 7: Browser Extensions Modifying the DOM

These are outside your control. Suppress where appropriate:

```tsx
// suppressHydrationWarning — only for leaf nodes with intentional differences
<div suppressHydrationWarning>
  {typeof window !== 'undefined' ? 'Client' : 'Server'}
</div>
```

---

## Hydration Debugging Checklist

When you see a hydration warning:

```
1. Read the error message — it tells you the mismatched attribute/content
2. Look for:
   □ Browser-only APIs (localStorage, window, navigator, document)
   □ new Date() or Date.now() without stable seed
   □ Math.random() or crypto.randomUUID() in render
   □ Conditional renders based on auth/session state
   □ Data fetched outside React Query

3. Fix strategy:
   □ useEffect to defer to client
   □ clientOnly() for components that don't need SSR
   □ useId() for dynamic IDs
   □ Loader + React Query for data consistency
   □ suppressHydrationWarning for intentional (documented) differences
```

---

## Component Patterns — Safe vs Unsafe

| Pattern | Safe? | Why |
|:---|:---|:---|
| `useState(initialValue)` | ✅ | Server and client use same initial value |
| `useState(() => fn())` with browser API | ❌ | Server throws, client succeeds |
| `useEffect(() => { setState(browserApi()) })` | ✅ | useEffect never runs on server |
| `clientOnly(() => <Component />)` | ✅ | Renders nothing on server |
| `typeof window !== 'undefined' ? x : y` in render | ⚠️ | Shows `y` on server, `x` on client → mismatch unless they're equal |
| Route loader data | ✅ | Consistent — server value passed to client |
| `useSuspenseQuery` with loader | ✅ | Cache pre-populated — same data |
| `useQuery` without loader | ⚠️ | Returns `undefined` on server, real data on client |
