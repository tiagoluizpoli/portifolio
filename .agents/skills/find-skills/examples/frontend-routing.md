# Frontend Routing Example — New UI Component

## Task
> "Add a new SkillCard component to the CMS skills list with a hover effect and an edit button"

## Phase 1: Dynamic Discovery

```bash
# Skill scan output:
SKILL: react-architect     | NAME: react-architect     | DESC: Senior React Architect. Designs bulletproof component systems...
SKILL: shadcn-specialist   | NAME: shadcn-specialist   | DESC: Expert in shadcn/ui component architecture, Radix primitives...
SKILL: frontend-specialist | NAME: frontend-specialist | DESC: Elite UI/UX specialist. Expert in aesthetics, color theory...
SKILL: tailwind-architect  | NAME: tailwind-architect  | DESC: Tailwind CSS v4.x architect. Expert in CSS-first configuration...
SKILL: appwrite            | NAME: appwrite            | DESC: Deep-dive specialist for Appwrite SDK v22.1.3...
SKILL: code-review         | NAME: code-review         | DESC: Performs expert-level code review...
# ... (all 29 skills shown)
```

Deep-reading candidates: `react-architect`, `shadcn-specialist`, `frontend-specialist`, `tailwind-architect`

## Phase 2: Semantic Task Analysis

```
Dimension 1 – Domain:
  Primary: Visual/UI (new component, hover effect)
  Secondary: Architecture (where does it live, how is it composed)

Dimension 2 – Artifact:
  NEW: components/composed/skill-card.tsx
  MAYBE: components/composed/skill-card-edit-button.tsx
  TOUCHES: skills page layout (import new card)

Dimension 3 – Technology:
  React (component, JSX)
  Tailwind CSS (hover utility classes, transition)
  shadcn Button (for the edit button)
  Possibly: shadcn Card as base

Dimension 4 – Action Type:
  Create (new component, never existed before)

Dimension 5 – Risk:
  Low-Medium → Single new file, but integrated into existing list rendering
  (risk from import integration, not from the component itself)
```

## Phase 3: Squad Assembly

**Cross-referencing with manifest:**

| Skill | Match | Score |
|:---|:---|:---|
| `react-architect` | Task is creating a React component — pattern selection needed | PRIMARY |
| `shadcn-specialist` | Uses shadcn Card + Button primitives | PRIMARY |
| `frontend-specialist` | Hover effect, spacing, a11y, focus ring | SUPPORTING |
| `tailwind-architect` | Tailwind classes, dark mode, transition utilities | SUPPORTING |
| `code-review` | 300-line limit, named exports — always Advisory | ADVISORY |
| `appwrite` | No data operations. | SKIP |
| `test-frontend` | Not explicitly requested, but a note on testability | SKIP (mention only) |

**Squad output:**
```
🔍 SKILL SCAN COMPLETE — Live manifest loaded from .agents/skills/

🧠 TASK ANALYSIS:
  - Domain: Visual/UI + Architecture
  - Artifact: New skill-card.tsx component
  - Technology: React, shadcn Card/Button, Tailwind v4
  - Action: Create (new component)
  - Risk: Low (isolated, new file)

⚡ SQUAD ASSEMBLED:
  PRIMARY  → react-architect    (component pattern, composition structure)
  PRIMARY  → shadcn-specialist  (Card + Button primitives, Radix a11y)
  SUPPORT  → tailwind-architect (hover classes, transition, v4 compliance)
  SUPPORT  → frontend-specialist (hover states, APCA contrast, focus ring)
  ADVISORY → code-review        (300-line limit: split if needed)
```

## Phase 4: Composite Persona

> "I am operating as a synthesis of the **React Architect** and **Shadcn Specialist** (primary), with the **Tailwind Architect** and **Frontend Specialist** providing precision standards.
>
> For this component: I will use a simple functional component pattern (no compound needed — one visual unit), build with `shadcn/ui Card` as the base primitive, apply hover lift using `transition-transform hover:-translate-y-0.5 shadow-md` in v4 syntax, ensure the edit button has a 44px minimum touch target, APCA Lc ≥ 60, and a visible focus ring. The component must not exceed 150 lines — it's a leaf component. Named export only."
