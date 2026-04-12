# Governance Blocks — Pre-Built Injection Templates

Copy-paste these blocks into every enhanced prompt where applicable.

---

## Block A: Core Governance (ALWAYS inject)

```markdown
**GOVERNANCE:**
- Components: ≤ 300 lines. Above → Composite Pattern decomposition.
- Exports: Named only. No `export default`.
- Types: Full type safety. No `any`, no untyped `as` casts.
- Quality Gate: `pnpm guard` must pass with zero warnings.
- Imports: Use `@/` path aliases. No relative `../../` beyond one level.
```

## Block B: UI Precision (inject for ANY UI task)

```markdown
**UI PRECISION:**
- If ANY visual change is required beyond the stated scope:
  1. STOP immediately before touching code.
  2. GATHER: Document current state, proposed change, and visual impact.
  3. LOG: Record in `.specify/memory/ui-decision-log.md` with date, tags, description.
  4. ASK: Request explicit user approval before proceeding.
- Zero implicit UI mutations. Every pixel change must be intentional and approved.
```

## Block C: Aesthetic Standards (inject for visual/frontend tasks)

```markdown
**AESTHETIC STANDARDS:**
- Colors: HSL/OKLCH semantic tokens only. No arbitrary hex. Max saturation 80%.
- Spacing: 4px grid strict. Use named tokens (space-1 through space-24).
- Typography: Major Third scale (1.250). Clamp() for responsive. No arbitrary px font sizes.
- Motion: Spring physics engine. No linear easing, no cubic-bezier unless explicitly justified.
  - Buttons: stiffness 400, damping 30
  - Dialogs: stiffness 300, damping 25
  - Lists: stiffness 100, damping 15, staggerChildren 0.05
- A11y: APCA Lc ≥ 75 body text, ≥ 60 interactive, ≥ 45 non-text.
- Reduced Motion: Always provide `prefers-reduced-motion` fallback.
- Shadows: Use elevation tokens (shadow-xs through shadow-2xl). Never arbitrary box-shadow.
```

## Block D: Tailwind v4 Compliance (inject when CSS is involved)

```markdown
**TAILWIND v4 COMPLIANCE:**
- Use `@theme` block in CSS, not `tailwind.config.js`.
- Replace ALL deprecated classes:
  - `bg-gradient-to-*` → `bg-linear-to-*`
  - `flex-shrink-0` → `shrink-0`
  - `flex-grow` → `grow`
  - `outline-none` → `outline-hidden`
  - Arbitrary values: brackets `[...]` → parentheses `(...)`
- Use `@utility` for custom utilities, `@variant` for custom variants.
- No `@apply`. No `!important`.
```

## Block E: Shadcn Compliance (inject when components are involved)

```markdown
**SHADCN COMPLIANCE:**
- Never modify files in `components/ui/`. Create wrappers in `components/composed/`.
- Every Dialog MUST include `DialogTitle` AND `DialogDescription`.
- Use `asChild` for custom triggers. Never nest `<button>` in `<button>`.
- Use Sonner for toast notifications. No custom toast systems.
- Forms: Always use `Form + FormField + FormItem` pattern with RHF + Zod.
```

## Block F: Appwrite Safety (inject for backend tasks)

```markdown
**APPWRITE SAFETY:**
- SDK version: v22.1.3 (`node-appwrite`).
- All queries use proper Appwrite Query helpers. No raw query strings.
- Permissions: Always specify document-level permissions. Never rely on collection defaults.
- Errors: Catch and re-throw as typed `AppwriteException`.
- Zod: Validate ALL input before any Appwrite operation.
- IDs: Use `ID.unique()` for new documents. Never hardcode IDs.
```

## Block G: Testing Standards (inject for test tasks)

```markdown
**TESTING STANDARDS:**
- Backend: Vitest + proper Appwrite mocks. No real API calls in tests.
- Frontend: React Testing Library + user-event. Test behavior, not implementation.
- E2E: Playwright with proper fixtures and page objects.
- Coverage: Minimum 80% for new code. Report via `pnpm test:coverage`.
- Assertions: Specific assertions. No `expect(x).toBeTruthy()` when value matters.
```

## Block H: Scope Definition Template (ALWAYS inject)

```markdown
**SCOPE:**
- **WILL change**: [List every file/component that will be modified]
- **MUST NOT change**: [List everything that must remain untouched]
- **Out of scope**: [List related but explicitly excluded work]
```
