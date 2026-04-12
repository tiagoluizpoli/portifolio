# Architecture Prompt Examples — Structural Transformations

---

## Example 1: Component Refactoring

### User Input
> "the about form is too big, break it up"

### Enhanced Output

```markdown
# Decompose AboutForm — Composite Pattern Refactoring

## Context
AboutForm exceeds the 300-line component limit, violating the project's architecture governance.
Must decompose using the Composite Pattern while preserving behavior.

## Specialists Engaged
- **react-architect**: Composite Pattern, shared form context, sub-component architecture
- **shadcn-specialist**: FormField composition, Card sectioning

## Technical Requirements
1. **Root**: `AboutForm.Root` — owns `useForm`, provides `FormProvider` context.
2. **Bio**: `AboutForm.Bio` — bio text, tagline, summary fields.
3. **Links**: `AboutForm.Links` — social links, website, GitHub fields.
4. **Metrics**: `AboutForm.Metrics` — impact metrics grid with CRUD.
5. **Actions**: `AboutForm.Actions` — Save/Discard buttons + dirty state.
6. Each sub-component accesses form via `useFormContext<AboutFormData>()`.
7. No prop drilling beyond 2 levels.

## Scope
- **WILL change**: AboutForm file structure (1 file → 5 files + barrel export)
- **MUST NOT change**: Form behavior, validation, API calls, visual appearance

## Success Criteria
- [ ] Each sub-component ≤ 150 lines
- [ ] Form behavior identical to before
- [ ] No visual changes
- [ ] All validation works as before
- [ ] `pnpm guard` passes

## Governance
- Composite Pattern with barrel exports
- Named exports only
- Zero visual regression
```

---

## Example 2: State Management

### User Input
> "the sidebar state is a mess, fix it"

### Enhanced Output

```markdown
# Refactor Sidebar State — Centralized State Management

## Context
Sidebar open/close state is scattered across multiple components, causing
inconsistent behavior and prop-drilling.

## Specialists Engaged
- **react-architect**: Provider Pattern, custom hooks, state colocation
- **tanstack-master**: URL state synchronization (if persistence needed)

## Technical Requirements
1. Create `SidebarProvider` with context: `{ isOpen, toggle, close, open }`.
2. Custom hook: `useSidebar()` — throws if used outside provider.
3. Persist state in `localStorage` for user preference.
4. Responsive: Auto-collapse below `lg` breakpoint.
5. Animation: Spring transition for open/close (stiffness 200, damping 25).
6. Keyboard: `Ctrl+B` toggles sidebar.

## Scope
- **WILL change**: Sidebar state management (providers, hooks, event handlers)
- **MUST NOT change**: Sidebar content, navigation items, visual design

## Success Criteria
- [ ] Single source of truth for sidebar state
- [ ] Zero prop-drilling for sidebar state
- [ ] State persists across page loads
- [ ] Responsive auto-collapse works
- [ ] Keyboard shortcut works
- [ ] `pnpm guard` passes

## Governance
- Provider + custom hook pattern
- No prop drilling
- Named exports only
```

---

## Example 3: Route Architecture

### User Input
> "reorganize the routes for the CMS"

### Enhanced Output

```markdown
# Restructure CMS Route Architecture — Feature-Based Partitioning

## Context
CMS routes need reorganization to follow feature-based partitioning under
the `/admin/` namespace.

## Specialists Engaged
- **tanstack-master**: TanStack Start routing, loaders, layout routes
- **react-architect**: File organization standards

## Technical Requirements
1. Root layout: `routes/admin/route.tsx` — CMS shell (sidebar + header).
2. Feature routes:
   - `routes/admin/home/route.tsx` — Home section
   - `routes/admin/profile/route.tsx` — Profile section
   - `routes/admin/posts/route.tsx` — Posts section
3. Each route uses loaders for data fetching.
4. Shared CMS layout provides navigation and breadcrumbs.
5. Route guards verify authentication.

## Scope
- **WILL change**: Route file locations, import paths
- **MUST NOT change**: Component implementations, data fetching logic, styling

## Success Criteria
- [ ] All routes accessible under `/admin/`
- [ ] Layout route provides shared CMS shell
- [ ] Breadcrumbs update per route
- [ ] Auth guard redirects unauthenticated users
- [ ] `pnpm guard` passes

## Governance
- Feature-based file organization
- Loaders for all data-dependent routes
- Named exports for route components
```

---

## Example 4: Performance Optimization

### User Input
> "the skills page is slow"

### Enhanced Output

```markdown
# Optimize Skills Page Performance — Rendering & Data Pipeline

## Context
Skills page has performance issues — likely causes: unnecessary re-renders,
unoptimized data fetching, or expensive component rendering.

## Specialists Engaged
- **react-architect**: React.memo, useMemo, Suspense boundaries, virtualization
- **tanstack-master**: Query optimization, stale-while-revalidate
- **frontend-specialist**: Skeleton loaders, progressive rendering

## Technical Requirements
1. **Profile**: Use React DevTools Profiler to identify bottleneck.
2. **Memoize**: Wrap expensive list items with `React.memo()`.
3. **Virtualize**: If > 50 items, use `@tanstack/react-virtual`.
4. **Suspense**: Add Suspense boundary with layout-matched skeleton.
5. **Query**: Ensure `staleTime` is set (not refetching every render).
6. **Code Split**: Lazy-load the SkillDialog component.

## Scope
- **WILL change**: Skills list rendering strategy, data query config
- **MUST NOT change**: Visual appearance, data shape, feature behavior

## Success Criteria
- [ ] Page loads in < 200ms (after hydration)
- [ ] Smooth scrolling with 100+ items
- [ ] No unnecessary re-renders (verify via Profiler)
- [ ] Skeleton shown during data loading
- [ ] `pnpm guard` passes

## Governance
- Profile before optimizing (no premature optimization)
- Virtualize if > 50 items
- Always measure before and after
```
