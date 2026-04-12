# State Management — The Decision Framework

React state management is not about picking a library. It's about picking the RIGHT category of state for each piece of data.

---

## The Five Categories of State

| Category | What It Is | Solution | Example |
|:---|:---|:---|:---|
| **Local State** | UI state scoped to one component | `useState`, `useReducer` | Modal open/closed, form input value, toggle |
| **Lifted State** | Shared between 2-3 sibling components | Lift to common parent | Selected tab, active filter |
| **Server State** | Data owned by the server, cached on client | TanStack Query | User profile, list of posts, API responses |
| **URL State** | Navigation and filter state persisted in URL | TanStack Router, `useSearchParams` | Page number, sort order, filter criteria |
| **Global State** | App-wide state accessed from many places | Context, Zustand, Jotai | Theme, auth session, locale, feature flags |

---

## Decision Tree

```
Is this data owned by the server?
  → YES: Use TanStack Query (or equivalent server state manager)
  → NO:
    Should this state persist across navigation?
      → YES: Put it in the URL (search params, route params)
      → NO:
        Is this state used by 3+ components across different subtrees?
          → YES:
            Does it change frequently (> 10x/second)?
              → YES: Use Zustand or Jotai (external store, no context re-render)
              → NO: Use Context (with memoized provider value)
          → NO:
            Is it shared between 2 siblings?
              → YES: Lift to common parent
              → NO: Use useState or useReducer (keep it local)
```

---

## 1. Local State (useState / useReducer)

The default. Always start here. If data doesn't need to leave the component, it stays local.

```tsx
// Simple toggle
const [isOpen, setIsOpen] = useState(false)

// Complex with explicit transitions (use useReducer)
const [state, dispatch] = useReducer(dialogReducer, { step: 'idle', data: null })
```

**Rules**:
- Keep state as close to where it's used as possible
- Don't lift state unless 2+ components need it
- If you have 4+ `useState` calls, consider grouping into `useReducer`
- Never store derived data in state

---

## 2. Server State (TanStack Query)

Any data that comes from an API, database, or external service is **server state**. It has unique challenges: caching, refetching, stale data, optimistic updates, pagination.

```tsx
// ✅ Basic query
const { data: users, isLoading, error } = useQuery({
  queryKey: ['users', { page, search }],
  queryFn: () => api.getUsers({ page, search }),
  staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
})

// ✅ Mutation with optimistic update
const updateUser = useMutation({
  mutationFn: api.updateUser,
  onMutate: async (newUser) => {
    await queryClient.cancelQueries({ queryKey: ['users', newUser.id] })
    const previous = queryClient.getQueryData(['users', newUser.id])
    queryClient.setQueryData(['users', newUser.id], newUser)
    return { previous }
  },
  onError: (_err, _new, context) => {
    queryClient.setQueryData(['users', context?.previous?.id], context?.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})
```

**Rules**:
- NEVER store API data in `useState`. Use TanStack Query.
- Query keys must be deterministic and include all variables that affect the result.
- Set appropriate `staleTime` (default is 0 — might be too aggressive for your use case).
- Prefetch data for likely-next-visited pages.

---

## 3. URL State

State that should survive page refreshes, be shareable via links, and work with browser back/forward.

```tsx
// ✅ Using TanStack Router search params
const { page, sort, filter } = Route.useSearch()

// ✅ Using React Router's useSearchParams
const [searchParams, setSearchParams] = useSearchParams()
const page = Number(searchParams.get('page')) || 1

// ✅ Updating URL state
function handlePageChange(newPage: number) {
  setSearchParams(prev => {
    prev.set('page', String(newPage))
    return prev
  })
}
```

**What belongs in URL state**:
- Pagination (page, pageSize)
- Sorting (sortBy, sortOrder)
- Filtering (search query, category, date range)
- Tab/view selection
- Modal open state (if the modal should be linkable)

**What does NOT belong in URL state**:
- Ephemeral UI state (hover, animation state)
- Large data blobs
- Anything the user wouldn't want to share via link

---

## 4. Form State (react-hook-form + Zod)

Forms are special. They combine local state, validation, error state, submission state, and sometimes server state.

```tsx
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user', 'viewer']),
})

type FormData = z.infer<typeof schema>

function UserForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', role: 'viewer' },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await api.createUser(data)
      toast.success('User created')
    } catch (err) {
      form.setError('root', { message: 'Failed to create user' })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* FormField wrappers for each input */}
      </form>
    </Form>
  )
}
```

**Rules**:
- Schema is the single source of truth (shared between form and server action)
- Use `zodResolver` to connect Zod to react-hook-form
- Handle submission errors via `setError('root', ...)` for display
- Use `useFormState` to isolate re-renders to individual fields

---

## 5. Global State

For truly global concerns: theme, auth session, locale, feature flags.

### Context (Low-Frequency)
```tsx
// ✅ Good for theme, auth, locale — changes rarely
const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const value = useMemo(() => ({ theme, setTheme }), [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
```

### Zustand (High-Frequency)
```tsx
// ✅ Good for frequently changing state accessed from many places
import { create } from 'zustand'

interface SidebarStore {
  isCollapsed: boolean
  toggle: () => void
  setCollapsed: (collapsed: boolean) => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isCollapsed: false,
  toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
}))
```

**Context vs. Zustand Decision**:
- Context: Theme, auth, locale, permissions (changes < 1x/minute)
- Zustand: Sidebar state, notification queue, selection state (changes frequently)
- Rule of thumb: If a Context change would cause 50+ components to re-render, use an external store.
