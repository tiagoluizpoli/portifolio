# Dimension Guide — Extracting Task Signals

The 5-dimension analysis is how `find-skills` avoids keyword matching and instead does genuine semantic understanding of what a task requires. Each dimension reveals a different facet of the task, and together they produce a complete picture that can be cross-referenced with the live skill manifest.

---

## Dimension 1: Domain

**Question**: What area of the system does this task primarily touch?

This is the broadest category. Most tasks belong to one primary domain, sometimes two.

| Domain | Indicators | Example Task Signals |
|:---|:---|:---|
| **Visual/UI** | How things look, feel, animate, or respond to interaction | "redesign", "make it prettier", "fix the hover state", "add animation" |
| **Data/Backend** | How information is stored, queried, validated, or secured | "save to database", "auth", "permissions", "schema", "migration" |
| **Architecture** | How code is organized, composed, and structured | "refactor", "split this component", "too complex", "spaghetti code" |
| **Testing/Quality** | How correctness is verified | "add tests", "coverage", "CI", "review", "guard fails" |
| **Design System** | Visual standards and cross-cutting design decisions | "design system", "palette", "DESIGN.md", "tokens", "branding" |
| **Tooling/DevOps** | Build systems, deployments, commits, configuration | "deploy", "commit", "CI/CD", "config", "monorepo" |
| **AI/Stitch** | AI-driven screen generation and design tooling | "Stitch", "generate a screen", "variant", "design MCP" |

**Signal extraction tip**: Look beyond the explicit words. "Fix the save button" is a **Data** + **Visual** task: it touches form state (Data/Architecture) and a UI element (Visual).

---

## Dimension 2: Artifact

**Question**: What specific files, components, or systems will *change* as a result of this task?

This dimension is the most concrete — it tells you exactly where the work happens.

| Artifact Type | Indicates | Relevant Skill Domains |
|:---|:---|:---|
| React component (`.tsx`) | Component architecture, rendering, state | Architecture, Visual |
| CSS / Tailwind classes | Styling, design tokens, layout | Visual, Design System |
| Zod schema | Data validation, type safety | Data/Backend |
| Appwrite migration | Database schema, persistence | Data/Backend |
| TanStack route / loader | Routing, data loading, SSR | Architecture |
| Test file (`.test.ts`) | Test coverage, verification | Testing |
| DESIGN.md | Design system governance | Design System |
| Stitch screen | AI-generated UI | AI/Stitch |
| GitHub Actions YAML | CI/CD pipeline | Tooling |
| Git history | Commits, branching | Tooling |

**Artifact extraction tip**: Even if the user doesn't name the files, infer them. "Fix the about form" implies changes to `about-form.tsx` (component) + possibly `about.schema.ts` (validation) + possibly a server function (data). That's 3 artifact types, pointing to Visual + Backend + Architecture.

---

## Dimension 3: Technology

**Question**: What specific technologies are directly invoked?

This dimension surface-maps to skills because most skills own specific technologies:

| Technology Mention | Strongly Implies |
|:---|:---|
| Tailwind, CSS, `class=`, `@theme` | `tailwind-architect` |
| `useState`, hooks, context, React patterns | `react-architect` |
| shadcn, Radix, Dialog, Sheet, Command | `shadcn-specialist` |
| Appwrite, databases, auth, storage, SDK | `appwrite` |
| TanStack Start, loaders, server functions | `tanstack-master` |
| Vitest, mocking, schemas | `test-backend` |
| RTL, `render`, `userEvent`, component tests | `test-frontend` |
| Playwright, E2E, user journey | `test-e2e` |
| Stitch, MCP, `generate_screen` | `stitch-architect` |
| motion, animation, spring, `framer-motion` | `frontend-specialist` |
| Git, commits, branches | `git-commit` |

**Technology extraction tip**: Technology signals are the most reliable dimension — when a specific technology is named, its owning skill is almost always at least "Supporting" level.

---

## Dimension 4: Action Type

**Question**: What is the agent being asked *to do* (not what, but *how*)?

The action type affects which aspects of a skill's knowledge are most critical:

| Action | Primary Knowledge Needed | Secondary Knowledge Needed |
|:---|:---|:---|
| **Create** (new component, feature, screen) | Patterns, architecture, how to build correctly | Governance rules, quality gates |
| **Fix** (bug, broken behavior) | Debugging patterns, root cause analysis | Testing, regression prevention |
| **Refactor** (improve structure without changing behavior) | Architecture patterns, decomposition | Testing (to verify no regression) |
| **Style** (change visual appearance) | Design system, Tailwind, aesthetics | A11y, performance impact |
| **Review** (code quality check) | Code review, constitution | All relevant domain skills |
| **Test** (add test coverage) | Testing patterns | The domain being tested |
| **Migrate** (upgrade, rename, move) | Migration patterns (Tailwind v4, schema) | Backwards compatibility |
| **Optimize** (performance, bundle size, CLS) | Performance patterns | Testing (to verify gains) |

**Action type tip**: "Add tests for the auth module" is an action type of **Test**, domain of **Data/Backend**, which immediately suggests `test-backend` as Primary and `appwrite` as Supporting (because you need to understand what to mock).

---

## Dimension 5: Risk

**Question**: What's the blast radius? How much could go wrong?

Risk determines how many Supporting and Advisory skills to add:

| Risk Level | Indicators | Response |
|:---|:---|:---|
| **Low** | Single-file change, isolated component, no shared state | 1 Primary, maybe 0 Supporting |
| **Medium** | 2-5 file changes, shared component, touches form state | 1-2 Primary, 1-2 Supporting |
| **High** | 5+ files, shared state/context, public API changes | 2-3 Primary, 2-3 Supporting + Advisory |
| **Critical** | Database schema, auth, permissions, routing | Max squad, Advisory includes `code-review` |

**Risk elevation signals**:
- Any change to database schema → elevate one level
- Any change to authentication → elevate one level
- Any change to shared design tokens → elevate one level
- Any change to routing → elevate one level
- User mentioned "it was working before" → elevate (regression risk)

---

## Putting It Together: The Signal Matrix

After analyzing all 5 dimensions, build a signal matrix:

```
Task: "The metrics form keeps crashing when I add a new metric"

Dimension 1 – Domain: Data (form mutation) + UI (form component)
Dimension 2 – Artifact: MetricForm.tsx, maybe server function, maybe schema
Dimension 3 – Technology: React (hooks, state), shadcn (Form/Dialog), maybe Appwrite
Dimension 4 – Action: Fix (bug) + Debug
Dimension 5 – Risk: Medium (touches form state, possible data corruption)

Cross-reference with manifest:
  →  react-architect    matches: hooks, state, component patterns    → Supporting
  →  shadcn-specialist  matches: Form/Dialog composition             → Primary
  →  appwrite           matches: possible schema/server function     → Supporting
  →  frontend-specialist              no strong match                → Skip
  →  tailwind-architect               no strong match                → Skip

Squad: PRIMARY [shadcn-specialist], SUPPORTING [react-architect, appwrite]
```
