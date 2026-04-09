# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Wire the Zenith Portfolio CMS to the Appwrite backend using a robust Repository Pattern. This implementation ensures that all infrastructure logic is centralized in the `@repo/appwrite-core` package, enforcing a strict separation of concerns as mandated by the Zenith Constitution. The frontend will leverage TanStack Form for state management and TanStack Query for data orchestration, with shared Zod schemas providing end-to-end type safety.

## Technical Context

**Language/Version**: TypeScript 5.7+ | Node.js 22+
**Primary Dependencies**: `node-appwrite` (v22.1.3), `@tanstack/react-form`, `@tanstack/react-query`, `zod`.
**Storage**: Appwrite (TablesDB, Assets/Trash Buckets).
**Testing**: Vitest (Unit/Integration), Testing Library (UI).
**Target Platform**: Linux/WASM (Deployment), Modern Browsers.
**Project Type**: Monorepo Web Application.
**Performance Goals**: <200ms form validation latency, <500ms section save time.
**Constraints**: All Appwrite calls must be server-side or via server-functions; UI must be infrastructure-agnostic.
**Scale/Scope**: 7 Editorial Sections, 2 Locales (EN/PT), 10+ Collections.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle XV (Infrastructure Invisibility)**: Will implement Repository Pattern in `@repo/appwrite-core`. UI will call high-level methods, not SDK.
- [x] **Principle XIII (TablesDB)**: All persistence uses `TablesDB` via the core package.
- [x] **Principle XVI (TanStack)**: Using TanStack Form and TanStack Query (RC standards).
- [x] **Principle VI (Type Safety)**: Shared models and Zod schemas across applications.
- [x] **Principle VIII (Clean Code/SOLID)**: Enforcing SRP in forms and Open/Closed in Repositories.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/appwrite-core/
├── src/
│   ├── repositories/    # Implementation of IO logic
│   ├── services/        # High-level orchestration
│   ├── models/          # Zod schemas & Shared types
│   └── server.ts        # Appwrite Provider initialization

apps/zenith/app/features/cms/
├── services/            # Application services (UI-specific)
├── components/sections/ # TanStack Form implementations
├── lib/                 # Forms orchestration
└── context/             # Orchestrated state
```

**Structure Decision**: Monorepo with a robust shared repository layer in `@repo/appwrite-core` to satisfy Principle XV.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Repository Pattern (Principle XV) | Decouples UI from Appwrite SDK. Required by Constitution. | Direct SDK calls in components are faster to write but fail the Quality Gate. |
