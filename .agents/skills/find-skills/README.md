# Find Skills — Autonomous Skill Router

Zero hardcoded references. Discovers what skills exist at runtime by scanning the filesystem and reading each skill's own `SKILL.md` description. Self-expanding: add a new skill directory and it's automatically discoverable.

## How It Works

1. **Scan** — Runs a bash scan of `.agents/skills/` to build a live manifest
2. **Analyze** — Reads the task across 5 dimensions (domain, artifact, tech, action, risk)
3. **Match** — Semantic cross-reference between task signals and skill descriptions
4. **Rank** — Assigns Primary / Supporting / Advisory scores
5. **Assemble** — Composes a minimum effective squad (≤ 5 active skills)
6. **Synthesize** — Merges squad directives into a unified composite persona

## Resources

| File | Purpose |
|:---|:---|
| `resources/scoring-rubric.md` | Detailed scoring criteria for Primary / Supporting / Advisory |
| `resources/dimension-guide.md` | How to extract task signals across all 5 analysis dimensions |
| `resources/conflict-resolution.md` | How to resolve contradictions between skill directives |
| `resources/squad-patterns.md` | Common squad compositions for recurring task archetypes |

## Examples

| File | Scenario |
|:---|:---|
| `examples/frontend-routing.md` | New UI component → Frontend Squad assembly walkthrough |
| `examples/backend-routing.md` | Data mutation with auth → Infrastructure Squad walkthrough |
| `examples/fullstack-routing.md` | Multi-domain feature → Full Stack Squad walkthrough |
| `examples/ambiguous-routing.md` | Vague "fix this" request → Disambiguation and routing |
| `examples/new-skill-routing.md` | Brand new unknown skill discovered → Self-expansion walkthrough |

## Self-Expansion

When a new skill is added to `.agents/skills/`, it MUST have:
- A `SKILL.md` with a `name:` field
- A `description:` field that accurately describes its specialty in ≤ 2 sentences

That's all. `find-skills` will discover it automatically on next invocation.
