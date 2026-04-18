# Implementation Plan: Refactor appwrite-migrator to Clean Architecture

**Branch**: `011-migrator-clean-refactor` | **Date**: 2026-04-18 | **Spec**: [spec.md](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/specs/011-migrator-clean-refactor/spec.md)
**Input**: Feature specification from `/specs/011-migrator-clean-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

The objective is to refactor the `appwrite-migrator` application to adhere to Clean Architecture, SOLID principles, AND encapsulate any infrastructure leakages. The primary goal is reducing the cognitive load created by a monolithic `index.ts` file by segregating concerns into domain-specific service classes (Seed, Migrate, Check, Template), alongside enforcing strict monorepo import practices, and purging SDK builders (like `Query`) from the Application Service layer into strictly isolated Repositories.

## Technical Context

**Language/Version**: Node.js 24 (LTS), TypeScript  
**Primary Dependencies**: `@repo/appwrite`, `@repo/config`, `commander`, `zod`
**Testing**: Vitest (Unit tests in `src/`, E2E tests in `tests/e2e/`)
**Target Platform**: Node.js execution environment (CLI)
**Project Type**: CLI Application (`apps/appwrite-migrator`)
**Performance Goals**: N/A for this refactor – execution flow should remain performant via native ES imports.
**Constraints**: Zero imports containing `.js` extension, fully decoupled entrypoint dispatching logic.
**Scale/Scope**: ~600 LOC refactor distributed across at least 4 new service classes and core domain interfaces.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **VIII. Clean Code & SOLID**: Adherence is the primary goal of this refactor. The monolithic script will be decomposed into Single-Responsibility Principle (SRP) classes.
- **IX. Mandatory Tooling**: Biome will validate the structural layout post-refactor.
- **XVIII. Mandatory Test-First Architecture**: Handled via `test-plan.md`. The `final-voyage.e2e.spec.ts` must pass seamlessly.
- **XV. Infrastructure Invisibility**: Centralizing data operations from legacy services into AbstractMode abstractions, and strictly isolating SDK builders like `Query` down into the `BaseRepository`.

## Project Structure

### Documentation (this feature)

```text
specs/011-migrator-clean-refactor/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output 
├── test-plan.md         # Phase 2 output
└── tasks.md             # Phase 2 output (tracked elsewhere)
```

### Source Code (repository root)

```text
apps/appwrite-migrator/
├── src/
│   ├── cli/
│   │   └── MigratorCli.ts       # CLI orchestration
│   ├── core/
│   │   ├── BaseService.ts       # Shared base abstractions
│   │   └── types.ts             # Domain models (Delta, Plan)
│   ├── services/
│   │   ├── CheckService.ts      # Implements Audit Logic
│   │   ├── MigrateService.ts    # Implements Migration Logic
│   │   ├── SeedService.ts       # Implements Seeding Logic
│   │   └── TemplateService.ts   # Implements Artifact Gen
│   └── tests/
│       └── e2e/                 # Retained for E2E logic
└── package.json                 # Updated explicitly for Node.js 24
```

**Structure Decision**: A Service/CLI modular approach specifically within `apps/appwrite-migrator` using internal aliases and isolated domain models has been selected.

## Complexity Tracking

*(No Constitution Check violations. Structurally decoupled architecture selected)*
