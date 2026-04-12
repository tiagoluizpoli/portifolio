# Squad Patterns — Common Compositions for Recurring Task Types

These are observed patterns in squad assembly for the most frequent task archetypes. They are **not hardcoded rules** — they are heuristics derived from recurring patterns. The actual squad is always assembled fresh via the live scan. These just help the router recognize "this looks like an archetype" when it's analyzing the task.

---

## Pattern 1: New UI Component

**Trigger signals**: "Create a new [component name]", "build a [feature] dialog", "add [feature] form"

**Typical squad:**
```
PRIMARY:   react-architect    — component structure, pattern selection  
PRIMARY:   shadcn-specialist  — radix primitives, composition patterns  
SUPPORT:   tailwind-architect — class composition, v4 compliance  
SUPPORT:   frontend-specialist — spacing, a11y, interactive states  
ADVISORY:  code-review        — 300-line limit, named exports  
```

**Key directives to synthesize:**
- Pick the right React pattern (Compound if multiple visual sub-parts, simple if not)
- Always use shadcn primitives, never reinvent
- Apply `@theme` tokens, never arbitrary values
- Ensure APCA Lc ≥ 60 on all interactive elements
- If component > 150 lines, plan decomposition upfront

---

## Pattern 2: Form + Validation

**Trigger signals**: "Add a form", "save [entity]", "validation for [field]", "fix create/edit"

**Typical squad:**
```
PRIMARY:   shadcn-specialist  — Form + FormField + Input composition  
PRIMARY:   appwrite           — server function, Zod schema, mutation  
SUPPORT:   react-architect    — form state, error boundaries  
SUPPORT:   tailwind-architect — form layout, error state styling  
ADVISORY:  test-backend       — what needs to be tested (schema, mutation)  
```

**Key directives:**
- Always use `Form + FormField + FormItem + FormControl + FormMessage`
- Zod schema = single source of truth for types
- Validate before every Appwrite operation
- Error states must be visually distinct (border-destructive + error icon)
- Disable submit during in-flight mutation

---

## Pattern 3: Backend / Data Operation

**Trigger signals**: "CRUD for [entity]", "Appwrite [operation]", "database", "schema migration"

**Typical squad:**
```
PRIMARY:   appwrite           — SDK operations, permissions, error handling  
SUPPORT:   tanstack-master    — server functions, loaders, query cache  
SUPPORT:   test-backend       — what to test, how to mock  
ADVISORY:  react-architect    — optimistic update patterns (if UI-facing)  
```

**Key directives:**
- `ID.unique()` for all new documents
- Document-level permissions always — never rely on collection defaults
- `safeParse` before every mutation
- Catch as `AppwriteException`, never generic `catch(e: unknown)`
- Always invalidate the relevant query key after mutation

---

## Pattern 4: Visual / Aesthetic Update

**Trigger signals**: "Make it look better", "redesign", "improve the UI", "fix the colors", "add animation"

**Typical squad:**
```
PRIMARY:   frontend-specialist — color, typography, motion, a11y  
PRIMARY:   tailwind-architect  — token usage, class migration, dark mode  
SUPPORT:   react-architect     — if component restructuring is needed  
ADVISORY:  code-review         — UI Red Flag Protocol enforcement  
```

**Key directives:**
- All colors via `@theme` tokens. No raw hex.
- Spacing on 4px grid. No arbitrary px.
- Animation via spring physics. No linear.
- APCA contrast check before and after
- UI Red Flag Protocol: Stop and log any change not in the original scope

---

## Pattern 5: Bug Fix

**Trigger signals**: "It's broken", "crashes", "not working", "bug", "fix", "stops"

**Typical squad:**
Determined by the domain of the bug. First, diagnose — then route.

```
Step 1: Identify the break point
  - Browser console error → likely UI or hydration (→ react-architect, frontend-specialist)
  - Network error → likely backend (→ appwrite, tanstack-master)
  - TypeScript error → likely schema/type mismatch (→ react-architect, appwrite)
  - Test failure → (→ relevant test skill)

Step 2: Assemble the squad based on the break point
```

**Key directive**: Never start fixing before diagnosing. Read the stack trace, check the console, inspect the data flow. The squad should emerge from evidence, not assumption.

---

## Pattern 6: Testing

**Trigger signals**: "Add tests", "test coverage", "write a test for", "CI fails"

**Typical squad:**
```
IF backend:   test-backend PRIMARY + appwrite SUPPORT
IF frontend:  test-frontend PRIMARY + react-architect SUPPORT
IF e2e:       test-e2e PRIMARY + tanstack-master SUPPORT (routing)
IF coverage:  test-coverage PRIMARY  
```

**Key directives:**
- Test behavior, not implementation
- Use `userEvent` over `fireEvent` for frontend tests
- Mock at the API boundary (not internal functions)
- Every test is independent — no shared state between tests
- Name tests as: "it [does something] when [condition]"

---

## Pattern 7: Architectural Refactor

**Trigger signals**: "It's getting too big", "split this", "this is messy", "too many responsibilities"

**Typical squad:**
```
PRIMARY:   react-architect    — decomposition patterns, 300-line enforcement  
SUPPORT:   code-review        — SOLID principles, constitution compliance  
SUPPORT:   test-frontend      — to verify no regression during refactor  
ADVISORY:  tailwind-architect — if CSS is involved in the restructuring  
```

**Key directives:**
- Profile before decomposing — understand the current structure first
- Use Composite Pattern for multi-sub-part components
- Named exports for all new sub-components
- Write regression tests before starting the refactor
- The visual output must be identical before and after

---

## Pattern 8: Stitch / AI Design

**Trigger signals**: "Generate a screen", "Stitch", "create a design", "variant", "DESIGN.md"

**Typical squad:**
```
PRIMARY:   stitch-architect   — MCP operations, prompt enhancement  
SUPPORT:   design-curator     — design system governance, DESIGN.md  
SUPPORT:   frontend-specialist — design token injection into prompts  
```

**Key directives:**
- Always read `DESIGN.md` before generating any screen
- Inject full color, typography, and spacing context into the prompt
- UI Red Flag Protocol: Only change what was requested in the screen
- Never edit other screens while generating a new one

---

## Pattern 9: Code Review

**Trigger signals**: "Review this", "is this good?", "check the code", "PR review"

**Typical squad**: Always load `code-review` as Primary. Then load the domain specialists for the code being reviewed.

```
PRIMARY:   code-review        — SOLID, constitution, architecture quality  
PLUS:      [domain specialists relevant to the code under review]
```

**Key directives:**
- Check against the project constitution first
- Check 300-line limit on every component
- Check for `any` types and unsafe casts
- Check for missing test coverage
- Check for implicit UI changes

---

## Pattern 10: Multi-Domain Feature

**Trigger signals**: "Build [feature] end-to-end", "new section of the CMS", "implement [feature]"

**The loading-depth approach** (no hard cap):

```
Step 1: Identify all sub-task domains
Step 2: For each domain, determine the loading mode:
  - FULL LOAD:       The domain that owns the primary deliverable
  - GOV LOAD:        Domains whose rules constrain all other deliverables
  - SIGNAL LOAD:     Domains that are adjacent but not driving implementation

Step 3: Announce the full picture upfront:
```

**Example: New CMS Section (end-to-end)**
```
⚡ MULTI-DOMAIN SQUAD:
  Full Load:    react-architect      (component architecture — primary artifact)
  Full Load:    appwrite             (new collection — primary artifact)
  Gov Load:     shadcn-specialist    (Dialog + Form rules apply)
  Gov Load:     tailwind-architect   (v4 compliance rules apply)
  Gov Load:     tanstack-master      (route/loader constraints apply)
  Gov Load:     test-backend         (new collection must be tested)
  Signal Load:  frontend-specialist  (accessibility rules to note)
  Signal Load:  code-review          (architecture governance rules noted)
```

**Key directive**: No arbitrary cap. The question is always "what loading depth is right for each?" not "how many can we fit?". A planning session might legitimately Signal Load every single skill in the ecosystem — that's breadth without bloat.

