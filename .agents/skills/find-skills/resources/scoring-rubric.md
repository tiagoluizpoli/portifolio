# Scoring Rubric — Primary / Supporting / Advisory

The scoring system determines how much of a skill's directives are loaded and enforced during task execution. Getting this right is the difference between a focused, effective squad and a noisy, conflicted one.

---

## Primary — Must Be Engaged

A skill scores **Primary** when the task's core deliverable is within the skill's primary domain of expertise.

**Criteria for Primary:**
- The task *directly creates or modifies* artifacts that the skill owns
- The task's success depends on correctly applying this skill's specific knowledge
- Getting it wrong without this skill's perspective would cause a defect

**Examples of Primary assignment:**

| Task | Primary Skill | Why |
|:---|:---|:---|
| "Add a new Dialog component" | `shadcn-specialist` | The task's artifact is a shadcn Dialog — this skill owns Dialog composition |
| "Migrate deprecated Tailwind classes" | `tailwind-architect` | The task is literally inside this skill's specialty |
| "Write Vitest tests for the auth module" | `test-backend` | The deliverable is backend tests — this skill owns that |
| "Generate a new Stitch screen" | `stitch-architect` | Stitch MCP usage is this skill's core purpose |

**Loading behavior for Primary:**
- Read the full `SKILL.md`
- Load and apply ALL directives, rules, and constraints
- The skill's anti-patterns become hard blockers
- Examples are used as implementation references

---

## Supporting — Should Be Engaged for Safety

A skill scores **Supporting** when the task *crosses into* or *creates dependencies with* the skill's domain, even if it's not the primary focus.

**Criteria for Supporting:**
- The task modifies files that the skill has governance over (e.g., touching CSS automatically involves `tailwind-architect`)
- A defect could emerge in this skill's domain if its perspective is ignored
- The skill provides cross-cutting concerns (a11y, performance, type safety) relevant here

**Examples of Supporting assignment:**

| Task | Supporting Skill | Why |
|:---|:---|:---|
| "Add a new Dialog component" | `frontend-specialist` | Component needs hover states, focus rings, APCA contrast |
| "Add a new Dialog component" | `tailwind-architect` | Component uses Tailwind — v4 rules apply to class composition |
| "Refactor the About form" | `react-architect` | Decomposition patterns and hook usage applies |

**Loading behavior for Supporting:**
- Read the `SKILL.md` summary sections
- Load governance rules and anti-patterns
- Do NOT load all examples — too much context
- The skill's rules are treated as constraints, not definitions of the deliverable

---

## Advisory — Read Rules, Don't Fully Load

A skill scores **Advisory** when its governance rules are relevant but it doesn't need to actively drive implementation.

**Criteria for Advisory:**
- The task doesn't touch the skill's primary domain, but the skill has rules that prevent common mistakes in any implementation
- The skill's constraints apply passively (e.g., constitution compliance, quality gates)
- Loading the full skill would be wasteful context usage

**Examples of Advisory assignment:**

| Task | Advisory Skill | Why |
|:---|:---|:---|
| Any code change | `code-review` | 300-line limit, named exports, no `any` apply to everything |
| Any UI change | `speckit-constitution` | Canvas Constitution governs all decisions |

**Loading behavior for Advisory:**
- Read ONLY the governance/constraint sections of the `SKILL.md`
- Note the relevant rules in the briefing
- Do not adopt the skill's full persona

---

## Scoring in Practice

When evaluating a candidate skill, ask these questions in order:

```
1. "Is the task's PRIMARY DELIVERABLE within this skill's core domain?"
   YES → Score: Primary

2. "Does the task TOUCH FILES or ARTIFACTS that this skill governs?"
   YES → Score: Supporting

3. "Does this skill have GOVERNANCE RULES that apply universally here?"
   YES → Score: Advisory

4. "Is there NO meaningful overlap?"
   YES → Skip — do not include in squad
```

---

## Squad Size & Loading Depth

There is **no hard limit on the number of skills** in a squad. The constraint isn't how many skills you engage — it's **how deeply you load each one**.

This distinction matters enormously for planning vs. implementation:

### Loading Modes

| Mode | When to Use | What You Load |
|:---|:---|:---|
| **Full Load** | Skill is directly producing implementation artifacts | Full `SKILL.md` — all rules, patterns, examples |
| **Governance Load** | Skill's rules apply but it's not the main implementer | Frontmatter + governance/constraint sections only |
| **Signal Load** | Skill's domain is relevant for planning/awareness | `name:` + `description:` only |

### Phase-Aware Loading

Different phases of work call for different loading strategies:

#### Planning & Specification (`speckit-specify`, `speckit-plan`, `speckit-tasks`)
→ **Broad Signal Load**. Scan all relevant skills, read descriptions, extract key constraints from each. No single skill needs to be fully loaded — you need the breadth of all domain considerations.

```
Planning task touching 8 domains?
→ Signal Load all 8 skills.
→ Full Load only the 1-2 that are writing the plan structure.
→ Result: broad awareness, no context bloat.
```

#### Implementation (`speckit-implement`)
→ **Targeted Full Load**. The skills whose artifacts you are actively building get fully loaded. Supporting skills get Governance Load. Everything else is Signal Only.

```
Building a new Dialog component:
→ Full Load:       shadcn-specialist (you're building the artifact it owns)
→ Full Load:       react-architect   (you're applying its patterns directly)
→ Governance Load: tailwind-architect (its rules constrain the CSS you write)
→ Signal Only:     appwrite (no backend interaction in this task)
```

#### Review & Audit (`code-review`, `speckit-analyze`)
→ **Wide Governance Load**. Many skills' rules apply as review criteria. Load governance sections from all relevant skills. Full Load only `code-review` itself.

```
Reviewing a full-stack feature:
→ Full Load:       code-review (the primary audit tool)
→ Governance Load: react-architect, shadcn-specialist, tailwind-architect, 
                   appwrite, tanstack-master, test-backend...
→ Result: comprehensive review checklist without full context bloat.
```

### Context Budget Guidance

As a practical heuristic — not a hard limit:

| Task Scope | Full Load | Governance Load | Signal Load |
|:---|:---|:---|:---|
| Tactical fix | 1-2 | 1-2 | As needed |
| Feature implementation | 2-3 | 2-4 | As needed |
| Multi-domain feature | 3-4 | 3-5 | As needed |
| Full planning session | 1-2 | 4-8 | All others |
| Architecture review | 1 | All relevant | All others |

**There is no ceiling on Signal Load or Governance Load — only Full Load should be managed carefully.**

