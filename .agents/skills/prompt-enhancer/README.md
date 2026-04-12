# Prompt Enhancer — Universal Prompt Architect

The universal preprocessing layer for every workflow in an engineering ecosystem. Transforms raw requests into high-fidelity, specialist-driven engineering briefs.

## What This Skill Does

1. **Classifies** the request domain (Frontend, Backend, Architecture, Testing, Design, DevOps)
2. **Routes** to the correct specialist squad via integrated `find-skills` intelligence
3. **Injects** governance constraints (Constitution, UI Red Flag, 300-line limit)
4. **Structures** the output as a measurable engineering brief
5. **Validates** the enhanced prompt before delivery

## Resources

| File | Contents |
|:---|:---|
| `resources/enhancement-pipeline.md` | Full step-by-step pipeline with decision trees |
| `resources/skill-routing.md` | Complete specialist registry with trigger keywords |
| `resources/governance-blocks.md` | Pre-built governance injection blocks |
| `resources/quality-gates.md` | Validation checklists for enhanced prompts |

## Examples

| File | Domain | Scenarios |
|:---|:---|:---|
| `examples/frontend-prompts.md` | Frontend/UI | 6 scenarios: button, form, dialog, animation, layout, responsive |
| `examples/backend-prompts.md` | Backend/Infra | 5 scenarios: auth, CRUD, migration, storage, permissions |
| `examples/architecture-prompts.md` | Architecture | 4 scenarios: refactoring, state, routing, performance |
| `examples/debugging-prompts.md` | Debugging | 5 scenarios: hydration, race condition, type error, CLS, memory leak |
| `examples/testing-prompts.md` | Testing | 4 scenarios: unit, integration, E2E, coverage |
| `examples/design-prompts.md` | Design/Stitch | 4 scenarios: screen gen, design system, theme edit, variant |
| `examples/devops-prompts.md` | DevOps/Git | 3 scenarios: commit, CI, deploy |

## Wired To

Every skill in the ecosystem invokes `prompt-enhancer` as its first step. This includes all `speckit-*` skills, all frontend specialist skills, `code-review`, `git-commit`, and all testing skills.

## Safety

- **Ambiguity Detection**: Refuses to guess — asks targeted questions instead
- **Scope Creep Detection**: Flags any enhancement expanding beyond original request
- **Conflict Resolution**: Lists contradictions and recommends resolution
- **Missing Context Recovery**: Checks constitution, decision logs, and conversation history
