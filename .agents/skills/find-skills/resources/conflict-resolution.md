# Conflict Resolution — When Skills Contradict Each Other

Sometimes two skills loaded into the same squad will have conflicting directives. This is not a failure — it's information. Conflicts reveal genuine design tension that needs a deliberate decision. The resolution process is explicit and transparent, never silent.

---

## Types of Conflicts

### Type 1: Direct Contradictions

Two skills give opposite instructions for the same thing.

**Example:**
- `react-architect` says: "Use `useReducer` for complex form state"
- `shadcn-specialist` says: "Always use `react-hook-form` with `FormProvider`"

For the same form component, these can appear to conflict. In reality, `useReducer` and `react-hook-form` can coexist — but the agent must know that and explain it.

**Resolution**: Identify whether it's a real conflict or a false one (both can be true simultaneously). If real, apply the hierarchy below.

---

### Type 2: Scope Conflicts

One skill says "always do X" but the task's context makes X inappropriate.

**Example:**
- `react-architect` says: "Components must not exceed 300 lines"
- But the task is a migration where temporary oversize is inevitable

**Resolution**: The governance rule stands, but the scope is explicitly time-bounded. Document as an exception in the decision log.

---

### Type 3: Style Conflicts

Two skills have different aesthetic preferences with no single correct answer.

**Example:**
- `frontend-specialist` recommends: Subtle glassmorphism, backdrop-blur-md
- `tailwind-architect` notes: "Keep backdrop-blur ≤ 16px for performance"

**Resolution**: Apply the more restrictive constraint (16px cap) while achieving the aesthetic goal with alternative means.

---

## Resolution Hierarchy

When a genuine conflict exists and cannot be reconciled:

```
Priority 1: Project constitution (project-level governance)
Priority 2: Security & data integrity (Appwrite permissions, type safety)
Priority 3: Correctness & behavior (tests must pass, features must work)
Priority 4: Performance (CLS, LCP, bundle size)
Priority 5: Aesthetics (visual quality, animation, polish)
Priority 6: Developer experience (code organization, readability)
```

Higher priority always wins. If two skills conflict at the same priority level, **ask the user**.

---

## Resolution Protocol

When a conflict is detected:

### Step 1: Name It
```
⚠️ SKILL CONFLICT DETECTED:
  - react-architect says: [exact directive]
  - shadcn-specialist says: [exact directive]
  - Conflict type: [Direct Contradiction / Scope / Style]
```

### Step 2: Classify It
- Is it a **false conflict**? (both can be true simultaneously) → Explain how and continue
- Is it a **real conflict**? → Apply hierarchy

### Step 3: Resolve It
```
✅ RESOLUTION:
  Applied: [which rule wins]
  Reason: [why in 1 sentence, citing the hierarchy]
  Trade-off: [what we give up by choosing this]
```

### Step 4: Document It
If the conflict involves a UI decision, log it in `.specify/memory/ui-decision-log.md` per the UI Red Flag Protocol.

---

## Common Known Conflicts

These are conflicts that appear frequently and have established resolutions:

| Skill A | Skill B | Apparent Conflict | Resolution |
|:---|:---|:---|:---|
| `react-architect` (useReducer) | `shadcn-specialist` (react-hook-form) | Form state management | Use RHF for form state, useReducer for UI state (separate concerns) |
| `frontend-specialist` (blur effects) | `tailwind-architect` (performance) | backdrop-blur intensity | Cap at `backdrop-blur-md` (12px). Beyond → use opacity-based alternative |
| `react-architect` (300-line limit) | Complex feature needs | Component size | Split into sub-components. Never accept a monolith |
| `tailwind-architect` (no @apply) | Legacy code with @apply | CSS pattern | Migrate existing @apply on edit, never add new @apply |
| `test-backend` (mock everything) | `appwrite` (real SDK patterns) | What to mock | Mock at the SDK boundary. Never mock internal business logic |
| `frontend-specialist` (spring physics) | Quick fix (no time for animation) | Animation on tiny change | If animation isn't the task's scope → Advisory only, don't add animation |
