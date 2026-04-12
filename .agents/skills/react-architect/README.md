# React Architect Skill

Senior React Architect specialist. Designs bulletproof component systems, enforces pattern discipline, and produces production-grade React code.

## What This Skill Does

This skill provides comprehensive guidance for building React applications that are:
- **Type-safe**: Zero `any`, explicit interfaces, proper generics
- **Composable**: Every component is designed to be composed with others
- **Performant**: Strategic memoization, code splitting, virtualization
- **Accessible**: WCAG 2.2 compliant, keyboard-navigable, screen-reader friendly
- **Maintainable**: Feature-based organization, single responsibility, 300-line limit

## Pattern Catalog

Every recognized React pattern is documented with production-grade examples:

### Essential (Tier 1)
| Pattern | File |
|:---|:---|
| Compound Component | `examples/compound-component.tsx` |
| Composite Pattern | `examples/composite-pattern.tsx` |
| Provider Pattern | `examples/provider-pattern.tsx` |
| Custom Hook Extraction | `examples/custom-hooks.ts` |
| Controlled/Uncontrolled | `examples/controlled-uncontrolled.tsx` |
| Error Boundary | `examples/error-boundary.tsx` |
| Form Architecture | `examples/form-architecture.tsx` |

### Advanced (Tier 2)
| Pattern | File |
|:---|:---|
| Polymorphic Component | `examples/polymorphic-component.tsx` |
| Render Props | `examples/render-props.tsx` |
| Slot Pattern | `examples/slot-pattern.tsx` |
| State Machine | `examples/state-machine.tsx` |
| Optimistic Update | `examples/optimistic-update.tsx` |

### Performance (Tier 3)
| Pattern | File |
|:---|:---|
| Suspense + Skeleton | `examples/suspense-loading.tsx` |
| Code Splitting | `examples/code-splitting.tsx` |
| Virtualized List | `examples/virtualized-list.tsx` |
| Event Delegation | `examples/event-delegation.tsx` |

## Resources

- `resources/component-architecture.md` — Deep-dive into every component pattern
- `resources/hooks-encyclopedia.md` — Every hook pattern with do/don't examples
- `resources/performance-guide.md` — Memoization, Suspense, code splitting, virtualization
- `resources/state-management.md` — Local, server, URL, form, and global state patterns
- `resources/server-components.md` — RSC architecture and client/server boundaries
- `resources/error-handling.md` — Error Boundaries, recovery, fallback UIs
- `resources/file-organization.md` — Feature-based folders and naming conventions

## Safety Rules

1. Max 300 lines per component file
2. Max 2 levels of prop drilling
3. No `any` — ever
4. No inline object/array literals in JSX props on hot paths
5. Every effect must have cleanup if it subscribes
6. Every data boundary must have an Error Boundary
7. All interactive elements must be keyboard-navigable
