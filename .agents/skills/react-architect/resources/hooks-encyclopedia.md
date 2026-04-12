# Hooks Encyclopedia — Every Pattern, Every Rule

The definitive reference for React hooks — built-in and custom. Every entry includes the correct usage, the common mistakes, and the "Architect's Rule" for when to apply it.

---

## Built-in Hooks

### useState
**Purpose**: Local component state.

```tsx
// ✅ Simple state
const [count, setCount] = useState(0)

// ✅ Lazy initialization (expensive computation runs only on mount)
const [data, setData] = useState(() => parseExpensiveJSON(rawData))

// ✅ Functional update (when new state depends on previous state)
setCount(prev => prev + 1)

// ❌ NEVER: Object mutation
const [user, setUser] = useState({ name: 'John', age: 30 })
user.name = 'Jane' // MUTATION! React won't re-render
setUser(user)      // Same reference — React skips update

// ✅ Correct: Spread to create new reference
setUser(prev => ({ ...prev, name: 'Jane' }))
```

**Architect's Rules**:
- Use lazy initializer for anything that involves parsing, computation, or reading from storage.
- If you have 3+ related pieces of state that always change together, consider `useReducer`.
- Never store derived data in state. If `fullName = firstName + lastName`, don't put `fullName` in state.

---

### useReducer
**Purpose**: Complex state logic with explicit transitions.

```tsx
type State = { count: number; step: number }
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; payload: number }
  | { type: 'reset' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step }
    case 'decrement':
      return { ...state, count: state.count - state.step }
    case 'setStep':
      return { ...state, step: action.payload }
    case 'reset':
      return { count: 0, step: 1 }
    default:
      // Exhaustive check — TypeScript will error if a case is missed
      const _exhaustive: never = action
      return state
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 })
```

**Architect's Rules**:
- Use discriminated unions for both State and Action types.
- The reducer MUST be a pure function — no side effects, no API calls, no localStorage.
- Add exhaustive checking with `never` to catch missing cases at compile time.
- Extract the reducer to a separate file for testability.

---

### useRef
**Purpose**: Mutable container that persists across renders without triggering re-renders.

```tsx
// ✅ DOM reference
const inputRef = useRef<HTMLInputElement>(null)
const focusInput = () => inputRef.current?.focus()

// ✅ Mutable value that survives re-renders (timers, previous values, flags)
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
const isMountedRef = useRef(false)

// ✅ Storing previous value
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

// ❌ NEVER: Using ref for state that should trigger re-renders
const countRef = useRef(0)
countRef.current++ // This updates, but the UI won't reflect it!
```

**Architect's Rules**:
- Type the ref correctly: `useRef<HTMLDivElement>(null)` for elements, `useRef<number>(0)` for values.
- Always check `ref.current` for null before accessing DOM methods (`ref.current?.focus()`).
- Use ref for "fire-and-forget" values (timers, animation frame IDs, previous values, event handler references).

---

### useEffect
**Purpose**: Synchronize with external systems (DOM, network, timers, subscriptions).

```tsx
// ✅ Data fetching with cleanup (abortable)
useEffect(() => {
  const controller = new AbortController()
  
  async function fetchData() {
    try {
      const res = await fetch(`/api/users/${id}`, { signal: controller.signal })
      const data = await res.json()
      setUser(data)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return // Expected
      setError(err)
    }
  }
  
  fetchData()
  return () => controller.abort()
}, [id])

// ✅ Event listener with cleanup
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [onClose])

// ❌ NEVER: Derived state in useEffect
useEffect(() => {
  setFullName(`${firstName} ${lastName}`) // THIS IS WRONG
}, [firstName, lastName])

// ✅ Correct: Derive during render
const fullName = `${firstName} ${lastName}`

// ❌ NEVER: Empty deps when deps exist
useEffect(() => {
  fetchUser(userId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []) // userId is a dependency! Don't suppress the lint!
```

**Architect's Rules**:
- Effects are for SYNCHRONIZATION, not for computing derived values.
- Every effect that subscribes MUST have a cleanup function.
- Never suppress `react-hooks/exhaustive-deps`. If the deps cause issues, redesign the code.
- Prefer TanStack Query for data fetching over manual useEffect + useState.

---

### useMemo
**Purpose**: Cache expensive computations between re-renders.

```tsx
// ✅ Expensive computation
const sortedItems = useMemo(
  () => items.toSorted((a, b) => a.name.localeCompare(b.name)),
  [items]
)

// ✅ Referential stability for objects passed to memoized children
const chartConfig = useMemo(
  () => ({ width: 800, height: 400, theme: currentTheme }),
  [currentTheme]
)

// ❌ NEVER: Trivial computation (adds overhead for no benefit)
const doubled = useMemo(() => count * 2, [count]) // Just use: const doubled = count * 2
```

**Architect's Rules**:
- Don't use useMemo unless: (a) the computation is genuinely expensive (>1ms), OR (b) the value is passed to a `React.memo` child.
- If you're unsure, don't memoize. Measure first. Premature optimization is harmful.
- The dependency array MUST be correct. If in doubt, add the dep.

---

### useCallback
**Purpose**: Cache a function reference between re-renders.

```tsx
// ✅ Callback passed to a memoized child
const handleClick = useCallback((id: string) => {
  setSelected(id)
}, [])

// ✅ Callback used as a dependency of useEffect
const fetchUser = useCallback(async (id: string) => {
  const res = await api.getUser(id)
  setUser(res)
}, [])

useEffect(() => {
  fetchUser(userId)
}, [fetchUser, userId])

// ❌ NEVER: Wrapping every callback "just in case"
const handleChange = useCallback((e) => setValue(e.target.value), []) // Unnecessary if parent isn't memoized
```

**Architect's Rules**:
- Same rule as useMemo — only use when passing to `React.memo` children or as effect dependencies.
- `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

---

### useContext
**Purpose**: Read context values.

```tsx
// ✅ Always wrap in a typed custom hook
function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ❌ NEVER: Using useContext directly in components
const auth = useContext(AuthContext) // No safety check! Could be undefined!
```

**Architect's Rules**:
- NEVER export the raw context. Only export the hook and provider.
- The hook MUST throw if used outside the provider.
- Split read and write contexts for performance in high-frequency scenarios.

---

### useTransition
**Purpose**: Mark state updates as non-urgent, allowing urgent updates (like typing) to interrupt them.

```tsx
const [isPending, startTransition] = useTransition()

function handleSearch(query: string) {
  setSearchQuery(query)                       // Urgent: update input immediately
  startTransition(() => {
    setFilteredResults(filterLargeDataset(query)) // Non-urgent: can be interrupted
  })
}
```

**Architect's Rules**:
- Use for filtering/sorting large lists while keeping input responsive.
- Show loading indicators via `isPending`.
- Never wrap urgent updates (user input) in transitions.

---

### useDeferredValue
**Purpose**: Defer updating a part of the UI to keep other parts responsive.

```tsx
const deferredQuery = useDeferredValue(searchQuery)
const isStale = deferredQuery !== searchQuery

// Use deferredQuery for expensive renders
<SearchResults query={deferredQuery} style={{ opacity: isStale ? 0.7 : 1 }} />
```

**Architect's Rules**:
- Use when you can't wrap the state update itself (e.g., it comes from a parent).
- Show staleness visually (opacity, loading indicator).
- Works great with `React.memo` — the memoized child skips re-renders until the deferred value changes.

---

## Custom Hook Patterns

### useDebounce
```tsx
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}
```

### useMediaQuery
```tsx
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}
```

### useLocalStorage
```tsx
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.warn(`Failed to persist ${key} to localStorage`)
    }
  }, [key, value])
  return [value, setValue] as const
}
```

### useClickOutside
```tsx
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}
```

### useIsomorphicLayoutEffect
```tsx
import { useEffect, useLayoutEffect } from 'react'

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
```

### useEventCallback
```tsx
export function useEventCallback<Args extends unknown[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R {
  const ref = useRef(fn)
  useIsomorphicLayoutEffect(() => {
    ref.current = fn
  })
  return useCallback((...args: Args) => ref.current(...args), [])
}
```

### useIntersectionObserver
```tsx
export function useIntersectionObserver(
  ref: React.RefObject<Element | null>,
  options?: IntersectionObserverInit
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(([entry]) => setEntry(entry), options)
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, options?.threshold, options?.root, options?.rootMargin])
  return entry
}
```
