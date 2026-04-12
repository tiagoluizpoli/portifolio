# Frontend Prompt Examples — UI/UX Transformations

Each example shows the raw user input and the fully enhanced engineering brief.

---

## Example 1: Button Fix (Simple)

### User Input
> "fix the save button"

### Enhanced Output

```markdown
# Fix CMS Save Button State Management

## Context
The save button in the CMS interface is either not enabling when the form is dirty, or
not disabling after a successful save. This is a form-state binding issue.

## Specialists Engaged
- **react-architect**: Form state management, controlled component patterns
- **shadcn-specialist**: Button component + loading state composition

## Technical Requirements
1. Verify `react-hook-form` `formState.isDirty` is correctly bound to button `disabled`.
2. Ensure `isSubmitting` state shows the loading spinner during save.
3. After successful save, call `form.reset(newValues)` to reset dirty state.
4. Button must use the `LoadingButton` wrapper from `components/composed/`.

## Aesthetic Requirements
- Button height: h-9 (36px) for compact CMS layout.
- Loading spinner: 16px (h-4 w-4), `animate-spin`, currentColor.
- Disabled state: opacity-50, pointer-events-none.
- No visual changes to button color, size, or position.

## Scope
- **WILL change**: Button disabled/loading state binding logic
- **MUST NOT change**: Button styling, position, size, color, or any other component

## Success Criteria
- [ ] Button enables only when form has unsaved changes
- [ ] Button shows spinner during save
- [ ] Button disables after successful save
- [ ] `pnpm guard` passes with zero warnings

## Governance
- 300-line component limit
- Named exports only
- UI Red Flag: If ANY visual change is needed, STOP and log
```

---

## Example 2: Form Redesign (Complex)

### User Input
> "redesign the about form to be more professional"

### Enhanced Output

```markdown
# Redesign About Section Form — Professional CMS Layout

## Context
The About section form needs a professional, high-density CMS aesthetic. This is a
visual overhaul requiring careful scope definition to avoid breaking functionality.

## Specialists Engaged
- **frontend-specialist**: Color calibration, spacing grid, typography hierarchy
- **react-architect**: Form component decomposition
- **tailwind-architect**: v4 utility composition, dark mode tokens
- **shadcn-specialist**: FormField composition, Card layout, Separator usage

## Technical Requirements
1. Use shadcn `Card` + `CardHeader` + `CardContent` for form sections.
2. Use `Separator` between logical form groups.
3. Maintain existing `react-hook-form` + Zod validation (no schema changes).
4. Decompose if form exceeds 300 lines into: `AboutForm.Root`, `AboutForm.Bio`, `AboutForm.Links`.

## Aesthetic Requirements
- Card: rounded-xl (12px), border border-border, bg-card, p-6
- Section headings: text-sm font-semibold text-foreground, tracking-tight
- Input labels: text-xs font-medium text-muted-foreground, uppercase, tracking-wide
- Inputs: h-9, rounded-md, border-input, focus:ring-2 ring-ring
- Spacing: form gap-6, field gap-2, section gap-8
- Dark mode: All tokens must work in both light/dark

## Scope
- **WILL change**: Form layout, visual structure, component decomposition
- **MUST NOT change**: Form behavior, validation logic, field names, submit handler, API calls

## Success Criteria
- [ ] Form looks professional with clear visual hierarchy
- [ ] All existing validation works unchanged
- [ ] Dark mode renders correctly
- [ ] `pnpm guard` passes with zero warnings
- [ ] No implicit behavior changes

## Governance
- 300-line limit per sub-component
- Named exports only
- UI Red Flag Protocol active for visual changes
- All spacing on 4px grid
```

---

## Example 3: Dialog Creation (New Feature)

### User Input
> "add an icon picker dialog"

### Enhanced Output

```markdown
# Create IconPicker Dialog — CMS Asset Selection Interface

## Context
The CMS needs an icon picker dialog for selecting icons from the @iconify/react library.
This is a new component that must integrate with existing form fields.

## Specialists Engaged
- **react-architect**: Compound component pattern, search/filter state
- **shadcn-specialist**: Dialog + Command (for searchable list) + ScrollArea
- **frontend-specialist**: Grid layout, hover states, focus management
- **tailwind-architect**: Grid utilities, responsive columns

## Technical Requirements
1. Use shadcn `Dialog` + `Command` for searchable icon selection.
2. Icon grid: `grid-cols-8` on desktop, responsive down to `grid-cols-4`.
3. Search via `CommandInput`, filter icons client-side.
4. Selected icon passes value back via `onSelect(iconName: string)` callback.
5. Must include `DialogTitle` and `DialogDescription` (Radix a11y requirement).

## Aesthetic Requirements
- Dialog width: max-w-2xl (672px)
- Icon cells: 48x48px (w-12 h-12), flex items-center justify-center
- Icon size: 24px (h-6 w-6), text-muted-foreground
- Hover: bg-accent, text-accent-foreground, rounded-lg
- Selected: ring-2 ring-primary, bg-primary/10
- Search input: h-9, rounded-md, sticky top-0
- ScrollArea: max-h-80 (320px)

## Scope
- **WILL change**: New component `components/composed/icon-picker-dialog.tsx`
- **MUST NOT change**: Existing form fields, button styles, dialog styles in `components/ui/`

## Success Criteria
- [ ] Dialog opens with full icon grid
- [ ] Search filters icons in real-time
- [ ] Selected icon returns via callback
- [ ] Dialog closes after selection
- [ ] All a11y requirements met (title, description, keyboard nav)
- [ ] `pnpm guard` passes

## Governance
- Single component ≤ 300 lines
- Use shadcn primitives, don't reinvent
- Named exports only
```

---

## Example 4: Animation Request

### User Input
> "add some animations to the dashboard cards"

### Enhanced Output

```markdown
# Add Spring Entrance Animation to Dashboard Metric Cards

## Context
Dashboard metric cards load without animation, making the page feel static.
Adding staggered spring entrance creates a premium, living interface.

## Specialists Engaged
- **frontend-specialist**: Spring physics configs, stagger timing, reduced motion
- **react-architect**: Animation wrapper pattern using framer-motion

## Technical Requirements
1. Use `framer-motion` AnimatePresence + stagger.
2. Container: `staggerChildren: 0.05` (50ms between each card).
3. Items: `initial: { opacity: 0, y: 8 }` → `animate: { opacity: 1, y: 0 }`.
4. Spring config: `stiffness: 100, damping: 15`.
5. Use `useInView` with `once: true` to trigger only on first viewport entry.

## Aesthetic Requirements
- Spring, not linear. Stiffness 100, Damping 15.
- Subtle y-offset (8px), not dramatic.
- Include blur: `filter: blur(4px)` → `blur(0px)` for polish.
- Reduced motion: `prefers-reduced-motion: reduce` → instant render, no animation.

## Scope
- **WILL change**: Dashboard card rendering (add motion wrappers)
- **MUST NOT change**: Card content, card styling, card layout, data fetching

## Success Criteria
- [ ] Cards animate in with stagger on first load
- [ ] Animation doesn't re-trigger on re-renders
- [ ] `prefers-reduced-motion` fallback works
- [ ] No CLS (Cumulative Layout Shift)
- [ ] Performance: No frame drops during animation

## Governance
- No linear easing anywhere
- Use framer-motion, not CSS animations for stagger control
- UI Red Flag: Only the entrance animation changes, nothing else
```

---

## Example 5: Layout Fix

### User Input
> "the sidebar is overlapping the content on mobile"

### Enhanced Output

```markdown
# Fix Mobile Sidebar Overflow — Responsive Layout Collision

## Context
The sidebar is overlapping main content on mobile viewports. This is a responsive
layout issue likely caused by missing breakpoint handling.

## Specialists Engaged
- **tailwind-architect**: Responsive breakpoints, conditional display
- **shadcn-specialist**: Sidebar component, Sheet pattern for mobile
- **frontend-specialist**: Z-index convention, viewport handling

## Technical Requirements
1. Desktop (≥ lg/1024px): Sidebar visible, fixed left, content offset.
2. Mobile (< lg): Sidebar hidden by default, accessible via hamburger → Sheet/Drawer.
3. Sidebar z-index: use `z-sticky` (100) on desktop, `z-overlay` (200) when open on mobile.
4. Content area: No negative margins or absolute positioning hacks.

## Scope
- **WILL change**: Sidebar responsive behavior, mobile toggle mechanism
- **MUST NOT change**: Sidebar content, navigation items, desktop appearance

## Success Criteria
- [ ] No overlap at any viewport width (320px to 2560px)
- [ ] Mobile sidebar opens via Sheet/Drawer
- [ ] Desktop sidebar renders as persistent panel
- [ ] `pnpm guard` passes

## Governance
- Use shadcn Sheet for mobile overlay
- Z-index convention: no arbitrary z-[999]
- Test at 320px, 768px, 1024px, 1440px
```

---

## Example 6: Responsive Design

### User Input
> "make the metrics grid responsive"

### Enhanced Output

```markdown
# Implement Responsive Metrics Grid — Breakpoint-Aware Column Layout

## Context
The metrics grid currently uses a fixed column count that breaks on smaller viewports.
Need dynamic responsive columns.

## Specialists Engaged
- **tailwind-architect**: Responsive grid utilities, breakpoint system
- **frontend-specialist**: Spacing system, card sizing

## Technical Requirements
1. Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
2. Gap: `gap-4` (16px) consistent across breakpoints.
3. Cards: `min-h-[120px]` to prevent collapse on narrow widths.
4. No container query needed — viewport breakpoints are sufficient here.

## Aesthetic Requirements
- Equal-height cards via grid auto-rows
- Cards maintain internal padding (p-6) at all sizes
- Consistent card radius (rounded-xl) regardless of column count

## Scope
- **WILL change**: Grid column CSS classes
- **MUST NOT change**: Card content, card styling, data binding

## Success Criteria
- [ ] 1 column at 320px, 2 at 640px, 3 at 1024px, 4 at 1280px
- [ ] No horizontal scroll at any breakpoint
- [ ] Cards maintain visual consistency
- [ ] `pnpm guard` passes

## Governance
- Use Tailwind breakpoints, not media queries
- No arbitrary [px] breakpoints
```
