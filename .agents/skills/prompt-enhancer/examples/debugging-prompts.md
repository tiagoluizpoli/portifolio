# Debugging Prompt Examples — Bug Fix Transformations

---

## Example 1: Hydration Error

### User Input
> "the page keeps flickering after load"

### Enhanced Output

```markdown
# Fix Hydration Mismatch — SSR/Client State Divergence

## Context
Page flickering after load indicates a hydration mismatch — the server-rendered
HTML doesn't match the client-rendered output, causing React to throw away
the SSR markup and re-render.

## Specialists Engaged
- **tanstack-master**: Hydration-safe patterns, SSR state serialization
- **react-architect**: Client-only rendering, useEffect guards

## Technical Requirements
1. **Identify source**: Check React DevTools for hydration warnings in console.
2. **Common causes**:
   - `typeof window !== 'undefined'` checks that create different server/client output
   - `Date.now()`, `Math.random()`, or any non-deterministic value in render
   - Browser APIs (localStorage, matchMedia) used during SSR
   - CSS-in-JS libraries generating different class names
3. **Fix pattern**: Use `useSyncExternalStore` with `getServerSnapshot` for browser-dependent state.
4. **Alternative**: Wrap browser-only content in `<ClientOnly>` boundary.

## Scope
- **WILL change**: Components causing hydration mismatch
- **MUST NOT change**: Visual appearance after hydration completes

## Success Criteria
- [ ] Zero hydration warnings in console
- [ ] No visible flicker on page load
- [ ] SSR content matches client render
- [ ] `pnpm guard` passes

## Governance
- Never use `typeof window` to conditionally render different HTML
- Use `useSyncExternalStore` for browser state
- Test with JS disabled to verify SSR output
```

---

## Example 2: Race Condition

### User Input
> "sometimes the form saves stale data"

### Enhanced Output

```markdown
# Fix Stale Data Race Condition — Form Submission Ordering

## Context
Rapid form submissions or concurrent saves are causing stale data to overwrite
newer data. Need proper request ordering or cancellation.

## Specialists Engaged
- **react-architect**: AbortController, debouncing, optimistic update rollback
- **tanstack-master**: Mutation ordering, onMutate/onError/onSettled

## Technical Requirements
1. **AbortController**: Cancel in-flight requests when a new save starts.
2. **Debounce**: Debounce rapid submissions (300ms).
3. **Optimistic Update**: Store previous data in `onMutate` for rollback.
4. **Rollback**: On error, revert to previous data via `onError` callback.
5. **Disable button**: Disable save button during in-flight mutation.

## Scope
- **WILL change**: Save function, mutation config, button state
- **MUST NOT change**: Form UI, validation, data schema

## Success Criteria
- [ ] Rapid saves don't cause stale data
- [ ] Previous in-flight request is cancelled
- [ ] Failed save rolls back to previous state
- [ ] User sees error notification on failure
- [ ] `pnpm guard` passes

## Governance
- Always use AbortController for cancellable requests
- Always implement rollback for optimistic updates
```

---

## Example 3: Type Error

### User Input
> "getting TS errors in the metrics component"

### Enhanced Output

```markdown
# Resolve TypeScript Errors — Metrics Component Type Alignment

## Context
TypeScript errors in the metrics component indicate a type mismatch between
the data model and the component props. Need to align types across all layers.

## Specialists Engaged
- **react-architect**: Type-safe component props, generic patterns
- **appwrite**: Document type definitions, query result types

## Technical Requirements
1. **Trace the chain**: Schema (Zod) → TypeScript type → Appwrite document → Component props.
2. **Ensure single source**: Zod schema is the source of truth, derive TS types from it.
3. **Fix mismatches**: Align component props with `z.infer<typeof metricSchema>`.
4. **Remove `any`**: Replace all `any` types with proper definitions.
5. **Remove unsafe casts**: Replace `as` casts with type guards or proper typing.

## Scope
- **WILL change**: Type definitions, component prop interfaces
- **MUST NOT change**: Runtime behavior, validation logic, UI rendering

## Success Criteria
- [ ] Zero TypeScript errors in metrics component
- [ ] Zero `any` types
- [ ] Zero unsafe `as` casts
- [ ] Zod schema → TS type → component props fully aligned
- [ ] `pnpm guard` passes

## Governance
- Zod schema is the single source of truth
- Use `z.infer<>` for type derivation
- No `any`, no untyped `as`
```

---

## Example 4: Layout Shift (CLS)

### User Input
> "the page jumps when data loads"

### Enhanced Output

```markdown
# Fix Cumulative Layout Shift — Loading State Skeleton Matching

## Context
Content reflow during data loading causes visible layout shift (CLS).
Need layout-matched skeleton loaders that reserve space.

## Specialists Engaged
- **frontend-specialist**: Skeleton loader patterns, shimmer animation
- **react-architect**: Suspense boundaries, loading states

## Technical Requirements
1. Create layout-matched skeleton for the data section.
2. Skeleton must have EXACT same dimensions as loaded content.
3. Use Suspense boundary with skeleton as fallback.
4. Skeleton uses shimmer animation (see frontend-specialist motion recipes).
5. No height: auto → explicit height transitions.

## Scope
- **WILL change**: Loading states, add skeleton components
- **MUST NOT change**: Loaded state appearance, data fetching logic

## Success Criteria
- [ ] Zero visible layout shift during loading
- [ ] Skeleton matches loaded content dimensions exactly
- [ ] Shimmer animation runs smoothly
- [ ] `prefers-reduced-motion` stops shimmer
- [ ] `pnpm guard` passes

## Governance
- Every async boundary needs a layout-matched skeleton
- No height: auto for dynamically loaded content
```

---

## Example 5: Memory Leak

### User Input
> "the app gets slow after navigating a lot"

### Enhanced Output

```markdown
# Fix Memory Leak — Event Listener / Subscription Cleanup

## Context
Progressive performance degradation after navigation suggests memory leaks
from uncleaned event listeners, subscriptions, or intervals.

## Specialists Engaged
- **react-architect**: useEffect cleanup, AbortController, subscription management

## Technical Requirements
1. **Audit**: Check all `useEffect` hooks for missing cleanup functions.
2. **Event listeners**: Ensure `removeEventListener` in cleanup.
3. **Intervals/Timeouts**: Ensure `clearInterval`/`clearTimeout` in cleanup.
4. **Subscriptions**: Ensure `unsubscribe()` in cleanup.
5. **AbortController**: Use for fetch requests, abort in cleanup.
6. **React Query**: Verify queries are garbage collected when components unmount.

## Scope
- **WILL change**: useEffect cleanup functions, subscription management
- **MUST NOT change**: Feature behavior, UI rendering

## Success Criteria
- [ ] No memory growth after 50 navigation cycles
- [ ] All useEffect hooks have proper cleanup
- [ ] Chrome DevTools Heap snapshot shows stable memory
- [ ] `pnpm guard` passes

## Governance
- Every useEffect with setup MUST have cleanup
- Every addEventListener MUST have removeEventListener
- Use AbortController for all fetch requests
```
