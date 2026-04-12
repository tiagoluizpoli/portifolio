# Component Architecture — The Complete Pattern Reference

This document covers every recognized React component pattern with when to use it, when NOT to use it, and the exact implementation approach.

---

## 1. Compound Component Pattern

**What**: A set of components that work together to form a complete UI, sharing implicit state through Context. The parent component manages state and child components consume it — the consumer sees a clean, declarative API.

**When to Use**:
- Multi-part UI widgets (Tabs, Accordion, Select, Menu, Combobox)
- When the relationship between parts is semantically fixed (a Tab always belongs to a TabList)
- When you want consumers to control layout/order without managing state

**When NOT to Use**:
- Simple one-piece components (a button doesn't need compound pattern)
- When there's no shared state between parts
- When nesting depth would exceed 3 levels

**Architecture**:
```
<Tabs>                    ← Root: owns state (activeTab, onChange)
  <Tabs.List>             ← Layout container for triggers
    <Tabs.Trigger />      ← Reads and sets activeTab via context
    <Tabs.Trigger />
  </Tabs.List>
  <Tabs.Content />        ← Conditionally renders based on activeTab
  <Tabs.Content />
</Tabs>
```

**Key Implementation Details**:
1. Root creates a Context with state + dispatch
2. Each child accesses context via a custom hook (`useTabsContext`)
3. The custom hook MUST throw if used outside the provider (fail-fast)
4. Static properties (`Tabs.List`) are assigned after component definition
5. `displayName` must be set for DevTools debugging

**See**: `examples/compound-component.tsx`

---

## 2. Composite Pattern

**What**: Breaking a large monolithic component into smaller, focused sub-components that can be composed together. Unlike Compound, each sub-component is self-contained and doesn't require shared Context — it receives what it needs via explicit props or `forwardRef`.

**When to Use**:
- A component file is approaching the 300-line safety limit
- A component has 2+ visually distinct sections
- You want to reuse parts of a component independently
- You need to forward refs to specific inner elements

**When NOT to Use**:
- The component is small and cohesive (< 100 lines)
- Splitting would create meaningless wrappers

**Architecture**:
```
// Before: Monolithic 400-line component
<UserProfile />

// After: Composited into focused parts
<UserProfile.Root>
  <UserProfile.Avatar />      ← Self-contained, receives src/alt
  <UserProfile.Info />         ← Self-contained, receives name/bio
  <UserProfile.Actions />      ← Self-contained, receives onEdit/onDelete
</UserProfile.Root>
```

**Key Implementation Details**:
1. Each sub-component uses `forwardRef` for DOM access
2. Root component provides layout (flexbox/grid), not state
3. Props are explicit — no implicit coupling between siblings
4. Each sub-component is independently testable
5. Use namespace exports: `UserProfile.Avatar = Avatar`

**See**: `examples/composite-pattern.tsx`

---

## 3. Provider Pattern

**What**: A Context-based pattern where a Provider component wraps a subtree to supply shared state, and consumer components access it via a typed custom hook.

**When to Use**:
- Data needs to be accessed by 3+ nested components
- Prop drilling has exceeded the 2-level maximum
- Multiple components need to read AND write the same state
- Theme, auth, locale, or feature flags

**When NOT to Use**:
- Data is only used by 1-2 nearby components (just pass props)
- Data changes at high frequency (> 10 updates/second) — use Zustand or signals
- You're creating a "God Context" that holds everything

**Architecture**:
```tsx
// 1. Define the context shape
interface ThemeContextValue {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

// 2. Create context (NEVER export the raw context)
const ThemeContext = createContext<ThemeContextValue | null>(null)

// 3. Create the hook (with safety check)
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// 4. Create the provider
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
```

**Critical Rules**:
1. NEVER export the raw `createContext` result — only the hook and provider
2. The hook MUST throw if used outside the provider (fail-fast pattern)
3. Memoize the context value object to prevent unnecessary re-renders
4. Split read-only and write contexts for performance if needed

**See**: `examples/provider-pattern.tsx`

---

## 4. Polymorphic Component

**What**: A component that can render as different HTML elements or other React components via an `as` (or `asChild`) prop, while maintaining full TypeScript inference for the target element's props.

**When to Use**:
- A visual component needs to be semantically different (`<Button as="a" href="/...">`  )
- Building a design system where the same visual style applies to different elements
- When you need `<Box as="section">` or `<Text as="h1">`

**When NOT to Use**:
- The component has fixed semantics (a `<Dialog>` is always a dialog)
- The additional type complexity isn't worth it for a one-off component

**Architecture**:
```tsx
type PolymorphicProps<E extends React.ElementType, P = object> = P &
  Omit<React.ComponentPropsWithoutRef<E>, keyof P> & {
    as?: E
  }

type PolymorphicRef<E extends React.ElementType> =
  React.ComponentPropsWithRef<E>['ref']
```

**Key Implementation Details**:
1. Default `as` prop to a sensible element (e.g., `'div'` for Box, `'span'` for Text)
2. Use `React.ElementType` as the generic constraint (supports both HTML tags and components)
3. Properly forward refs with the correct element type
4. Use `Omit` to prevent prop conflicts between the component's own props and the element's props

**See**: `examples/polymorphic-component.tsx`

---

## 5. Render Props

**What**: A pattern where a component accepts a function as a prop (or as `children`) that receives data/state and returns JSX. The component handles the logic; the consumer controls the rendering.

**When to Use**:
- The component manages complex logic (mouse tracking, intersection, resize) but needs flexible rendering
- When you want maximum control over what gets rendered
- When HOCs would create wrapper hell

**When NOT to Use**:
- Most cases where a custom hook would suffice (hooks replaced render props for logic reuse)
- When the render callback never changes (just use a regular component)
- When it creates deeply nested callbacks ("callback hell")

**Architecture**:
```tsx
<MouseTracker>
  {({ x, y, isHovering }) => (
    <div>
      Mouse is at ({x}, {y}) {isHovering ? '(hovering)' : ''}
    </div>
  )}
</MouseTracker>
```

**Modern Alternative**: In most cases, prefer a custom hook:
```tsx
const { x, y, isHovering } = useMousePosition(ref)
```

Render props still shine when you need to **inject behavior into existing component trees** without creating new hooks.

**See**: `examples/render-props.tsx`

---

## 6. Slot Pattern

**What**: Inspired by Radix UI. A `<Slot>` component that merges its props (including event handlers, classes, styles) onto its single child element, allowing the consumer to control the rendered tag while the Slot injects behavior.

**When to Use**:
- You're building a component that wants to "enhance" whatever element the consumer provides
- `asChild` prop pattern (Radix's approach)
- When you need to merge event handlers, classNames, and refs from both parent and child

**When NOT to Use**:
- When polymorphic `as` prop is sufficient
- When the child is always the same element type

**Architecture**:
```tsx
<Button asChild>
  <a href="/login">Log In</a>  {/* Renders as <a> with Button's styles + behavior */}
</Button>
```

**Key Implementation Details**:
1. Slot clones the child and merges props
2. Event handlers are composed (both parent's and child's handlers fire)
3. ClassNames are concatenated (using `cn()`)
4. Refs are merged using a ref merging utility
5. Slot MUST assert exactly one child (throw if 0 or 2+)

**See**: `examples/slot-pattern.tsx`

---

## 7. Controlled/Uncontrolled

**What**: A component that works in both controlled mode (parent manages state via `value` + `onChange`) and uncontrolled mode (component manages its own internal state, parent reads via `ref`).

**When to Use**:
- Form inputs and any component with user-editable state
- When you want the component to be flexible for different consumption patterns
- Building reusable libraries or design system primitives

**Architecture**:
```tsx
// Controlled: parent owns state
<Input value={name} onChange={setName} />

// Uncontrolled: component owns state, parent reads via ref
<Input defaultValue="John" ref={inputRef} />
```

**Key Implementation Details**:
1. Check if `value` prop is `undefined` to determine mode
2. Use internal state (`useState`) for uncontrolled mode
3. In controlled mode, never set internal state — defer to parent
4. The `onChange` callback signature must be identical in both modes
5. Use `useRef` to track whether the component has ever been controlled (warn if mode switches)

**See**: `examples/controlled-uncontrolled.tsx`

---

## 8. State Machine (useReducer)

**What**: Modeling complex component state as a finite state machine using `useReducer`, where every state transition is explicit and documented.

**When to Use**:
- Multi-step flows (wizards, onboarding, checkout)
- Components with complex state transitions (upload: idle → selecting → uploading → success/error)
- When you need to prevent impossible states (e.g., loading AND error simultaneously)

**When NOT to Use**:
- Simple boolean toggles or single-value state
- When the state graph would have only 2-3 nodes

**Architecture**:
```tsx
type UploadState =
  | { status: 'idle' }
  | { status: 'selecting' }
  | { status: 'uploading'; progress: number }
  | { status: 'success'; url: string }
  | { status: 'error'; message: string }

type UploadAction =
  | { type: 'SELECT_FILE' }
  | { type: 'START_UPLOAD' }
  | { type: 'UPLOAD_PROGRESS'; progress: number }
  | { type: 'UPLOAD_SUCCESS'; url: string }
  | { type: 'UPLOAD_ERROR'; message: string }
  | { type: 'RESET' }
```

**Key Implementation Details**:
1. Use discriminated unions for state (the `status` field is the discriminant)
2. The reducer is a pure function — no side effects, no API calls
3. Side effects happen in the component (via `useEffect` watching state transitions)
4. Impossible states are impossible by construction (you can't have `progress` in `idle` state)

**See**: `examples/state-machine.tsx`

---

## 9. Error Boundary

**What**: A class component (or library wrapper) that catches JavaScript errors in its child component tree and renders a fallback UI instead of crashing the whole app.

**When to Use**:
- Around every data-fetching boundary
- Around third-party components you don't control
- Around route-level components
- As a global catch-all at the app root

**Architecture**:
```
<App>
  <ErrorBoundary fallback={<AppError />}>           ← Global catch-all
    <Layout>
      <ErrorBoundary fallback={<PageError />}>      ← Route-level
        <Dashboard>
          <ErrorBoundary fallback={<WidgetError />}> ← Widget-level
            <MetricsChart />
          </ErrorBoundary>
        </Dashboard>
      </ErrorBoundary>
    </Layout>
  </ErrorBoundary>
</App>
```

**Key Implementation Details**:
1. Error Boundaries only catch errors during rendering, lifecycle methods, and constructors
2. They do NOT catch errors in event handlers (use try/catch), async code, or SSR
3. Always provide a recovery mechanism (retry button, navigate away)
4. Log errors to an error reporting service (Sentry, etc.)
5. Use `react-error-boundary` library for functional component support

**See**: `examples/error-boundary.tsx`

---

## 10. Form Architecture

**What**: A systematic approach to building complex forms using react-hook-form for state management, Zod for validation, and shadcn for UI primitives.

**When to Use**:
- Any form with validation
- Multi-step forms with per-step validation
- Forms with dynamic fields (arrays, conditional fields)
- Server action forms with optimistic updates

**Architecture**:
```
Schema (Zod)          → Single source of truth for validation
  ↓
Form Hook (RHF)       → Manages state, validation, submission
  ↓
Form Components       → shadcn primitives with FormField wrapper
  ↓
Server Action         → Type-safe submission with revalidation
```

**Key Implementation Details**:
1. Schema is defined ONCE in a shared location (referenced by form AND server action)
2. Use `zodResolver` to connect Zod schema to react-hook-form
3. Wrap each field in `<FormField>` for automatic error display
4. Handle submission errors by setting form errors (`setError('root', ...)`)
5. Use `useFormState` for performance (isolate re-renders to specific fields)

**See**: `examples/form-architecture.tsx`
