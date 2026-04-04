# Implementation Plan: Refactoring Zenith Architecture

**Branch**: `005-refactor-zenith-architecture` | **Date**: 2026-04-04 | **Spec**: [specs/005-refactor-zenith-architecture/spec.md](specs/005-refactor-zenith-architecture/spec.md)
**Input**: Feature specification from `/specs/005-refactor-zenith-architecture/spec.md`

## Summary

This plan outlines the restructuring of Zenith's startup sequence for fail-fast error resilience (FR-011), the instantiation of a centralized `TransactionManager` to orchestrate multi-step AppWrite RPCs with compensating actions (FR-015), and the extraction of 400+ lines of monolithic JSX out of the `routes/index.tsx` orchestrator (FR-006) to enforce the Bulletproof architecture constraint.

## Technical Context

**Language/Version**: TypeScript 5.7+
**Primary Dependencies**: TanStack Start v1 (RC), React 19, Zod
**Storage**: N/A (Abstraction layer over existing AppWrite SDK)
**Testing**: Vitest for unit tests
**Target Platform**: Node.js + Client
**Project Type**: Web Application Dashboard
**Performance Goals**: `< 50ms` boot overhead for interceptor, `< 2.5s` TTI
**Constraints**: Zero Node.js process crashes during env parsing; `< 100 LoC` for `index.tsx`
**Scale/Scope**: Refactoring existing functionality, no new visual screens.

## Constitution Check

*GATE: Passed*

- **I. Simplicity First**: Does not over-engineer; uses existing Zod abstractions.
- **VIII. Clean Code & SOLID**: Fixes massive SRP violation in route orchestrator.
- **IX. Mandatory Tooling**: Biome will be used for all formatting checks.
- **XI. Single VCS & XII. Mandatory Quality Gating**: No git-in-git, must pass `pnpm guard`.
- **XV. Infrastructure Invisibility**: Centralizing TransactionManager behind `@repo/appwrite-core`.

## Security Boundary Mapping

**Definition**: This feature introduces a structural refactoring around mutations.
- **CLIENT-SIDE**: All UI elements in `features/dashboard/components` act purely as presentation layers, handling state only for display toggles or local interactions.
- **SERVER-SIDE**: The `TransactionManager` runs exclusively in the TanStack Start backend (`createServerFn`). It represents a strict security and data integrity boundary, ensuring compensation routines are unreachable from the client network.

## Architecture-Level Test Plan

- **Vitest**: We will implement unit testing targeting `packages/appwrite-core/src/transactions/TransactionManager.ts`. Tests will mock LIFO compensation stacks, ensuring that exceptions mid-transaction successfully trigger `.rollback()` operations.
- **Playwright (BDD)**: We will write an E2E startup spec to verify that navigating to `http://localhost:5173` with `APPWRITE_API_KEY` stripped out yields our static fallback element (`#startup-error-interceptor`) with HTTP 503 instead of hanging or returning a 502 Bad Gateway.

## Project Structure

### Documentation (this feature)

```text
specs/005-refactor-zenith-architecture/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/zenith/
├── package.json
└── app/
    ├── config/
    │   └── env.ts                # Updated to bypass validation crash via flag or pure schema
    ├── entry-server.ts           # Intercept runtime init errors here or via plugin
    ├── routes/
    │   └── index.tsx             # Reduced to < 100 LoC
    ├── infrastructure/appwrite/
    │   └── server.ts             # Adapted to use TransactionManager context
    └── features/
        └── dashboard/
            ├── components/       # Monolith extracted here (kpi, access, regions)
            └── ui/

packages/appwrite-core/
└── src/
    └── transactions/
        └── TransactionManager.ts # Core implementation for compensating transactions
```

**Structure Decision**: A Web Application monorepo strategy with shared `@repo/appwrite-core` usage. Logic extracted from main routing components into domain-isolated `features/dashboard/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | *N/A* | All refactors actively *reduce* code complexity |
