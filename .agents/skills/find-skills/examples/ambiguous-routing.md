# Ambiguous Routing Example — Vague "Fix This" Request

## Task
> "fix it"

This is the most difficult routing scenario. Zero domain signals. Zero technology signals. Zero artifact signals. The router must **diagnose before routing**.

## Phase 1: Dynamic Discovery

Scan runs normally. Full manifest available. But we cannot route without more information.

## Phase 2: Semantic Task Analysis

```
Dimension 1 – Domain:   UNKNOWN
Dimension 2 – Artifact: UNKNOWN
Dimension 3 – Technology: UNKNOWN
Dimension 4 – Action Type: Fix (but what?)
Dimension 5 – Risk: UNKNOWN (could be anything)
```

## Phase 3: Disambiguation Protocol

Before assembling any squad, the router must gather context:

### Step 1 — Check Available Context
- Is there an active `task.md`? Read it.
- Is there a recent `implementation_plan.md`? Read it.
- Is there a recent conversation context? Review it.
- Is there an error in the terminal? Read it.
- Is there a browser tab open? What does it show?

### Step 2 — Look for Error Signals
```bash
# Check for recent error logs
cat .specify/memory/ui-decision-log.md | tail -20

# Check if there are any TypeScript errors
npx tsc --noEmit 2>&1 | head -30

# Check if there are any lint errors
pnpm lint 2>&1 | head -30
```

### Step 3 — Ask if Still Unclear

If context still doesn't clarify the task:
```
⚠️ DISAMBIGUATION NEEDED:

The request "fix it" doesn't provide enough context to route to 
the right specialists.

To assemble the right squad, I need to know:
1. What specifically is broken? (What are you seeing that's wrong?)
2. Where does the issue occur? (Which page, component, or feature?)
3. Is there an error message? (Console, TypeScript, or terminal output?)

Without this, I risk loading the wrong specialists and missing the root cause.
```

## Phase 3 (After Disambiguation): Real Routing

**User responds**: "The save button in the About section stays disabled even after I change something in the form"

Now we have real signals:

```
Dimension 1 – Domain: UI (button state) + Architecture (form state binding)
Dimension 2 – Artifact: AboutForm component, CmsSaveButton component
Dimension 3 – Technology: react-hook-form (formState.isDirty), React state
Dimension 4 – Action Type: Fix (behavioral bug, not visual)
Dimension 5 – Risk: Low-Medium (form-level, doesn't touch backend)
```

**Squad:**
```
⚡ SQUAD ASSEMBLED (post-disambiguation):
  PRIMARY  → react-architect    (form state binding, isDirty logic, RHF patterns)
  PRIMARY  → shadcn-specialist  (Button disabled prop, FormProvider context)
  SUPPORT  → frontend-specialist (loading state visual, disabled opacity)
  ADVISORY → code-review        (no new code added — minimal blast radius)
```

**Composite persona:**
> "The issue is almost certainly a `formState.isDirty` binding issue. Either the button isn't reading `isDirty` correctly, or the form isn't being reset after a successful save (which would make it always appear dirty). I'm checking the RHF `FormProvider` context chain first."
