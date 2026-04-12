# New Skill Routing Example — Self-Expansion in Action

## Scenario

A new skill called `drizzle-orm` has been added to `.agents/skills/drizzle-orm/SKILL.md` with:
```yaml
name: drizzle-orm
description: Expert in Drizzle ORM for TypeScript — schema definition, type-safe 
  queries, migrations, and integration with edge runtimes. Covers relations, 
  transactions, batch operations, and query optimization.
```

No one has updated `find-skills`. No one has modified `prompt-enhancer`. The skill simply exists now.

## Task
> "Set up Drizzle ORM for the portfolio database layer"

## Phase 1: Dynamic Discovery

```bash
# Scan runs and now discovers:
SKILL: appwrite        | ... | Deep-dive specialist for Appwrite SDK v22.1.3...
SKILL: drizzle-orm     | ... | Expert in Drizzle ORM for TypeScript — schema definition...
SKILL: react-architect | ... | Senior React Architect...
# ... (all 30 skills)
```

The router has NEVER seen `drizzle-orm` before. But it sees it now. The description is clear enough to understand what it does.

## Phase 2: Semantic Task Analysis

```
Dimension 1 – Domain: Data/Backend (ORM, database layer)
Dimension 2 – Artifact: Schema files, query functions, migration files
Dimension 3 – Technology: Drizzle ORM (mentioned directly), TypeScript
Dimension 4 – Action Type: Create (initial setup)
Dimension 5 – Risk: HIGH (database layer = foundational infrastructure)
```

## Phase 3: Self-Expansion in Action

**Cross-referencing with manifest:**

| Skill | Match Reasoning | Score |
|:---|:---|:---|
| `drizzle-orm` | This skill's description EXACTLY matches the task domain | PRIMARY |
| `tanstack-master` | TanStack Start needs to know about the new data layer | SUPPORTING |
| `appwrite` | If migrating away from Appwrite, need transition knowledge | SUPPORTING/ADVISORY |
| `test-backend` | New data layer = new testing patterns needed | ADVISORY |

**The router has never seen `drizzle-orm` before — but it routes to it correctly.** This is self-expansion working.

**Squad output:**
```
🔍 SKILL SCAN COMPLETE — 30 skills discovered (1 new since last invocation: drizzle-orm)

📦 NEW SKILL DETECTED: drizzle-orm
  Reading full SKILL.md to understand capabilities...
  ✓ Domain: Data/Backend (ORM, TypeScript queries, migrations)
  ✓ Relevant to: "Set up Drizzle ORM for the portfolio database layer"
  
🧠 TASK ANALYSIS:
  - Domain: Data/Backend (ORM setup, schema definition)
  - Artifact: Schema files, query functions, migration config
  - Technology: Drizzle ORM, TypeScript
  - Action: Create (initial setup)
  - Risk: HIGH (database layer change)

⚡ SQUAD ASSEMBLED:
  PRIMARY  → drizzle-orm      (schema definition, type-safe queries, migrations)
  SUPPORT  → tanstack-master  (integration with server functions and loaders)
  ADVISORY → appwrite         (migration path awareness if transitioning)
  ADVISORY → test-backend     (new patterns will need test coverage)
```

## Key Insight

The router didn't need to be updated. It read the description, understood the domain, and routed correctly — autonomously. The skill's own `description:` field is the contract between the skill and the router.

## Requirements for Self-Expandable Skills

For a new skill to be automatically discoverable and routeable, its `SKILL.md` MUST have:

```yaml
---
name: skill-directory-name   # Must match directory name
description: |
  A 1-2 sentence description that:
  1. Names the specific technology/domain it covers
  2. Describes what it helps accomplish
  3. Is specific enough to distinguish from other skills
---
```

**Good description** (router can route to this):
```
Expert in Drizzle ORM for TypeScript — schema definition, type-safe queries, 
migrations, and integration with edge runtimes.
```

**Bad description** (router cannot meaningfully route to this):
```
Helps with databases.
```

**Worst case** (router skips it):
```
(no description field)
```
