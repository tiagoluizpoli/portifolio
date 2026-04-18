# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Refactor the `appwrite-migrator` CLI application from a monolithic script to a modular, class-based Clean Architecture. This involves splitting `src/index.ts` into a CLI entry point, dedicated service classes for each mode, and co-located unit tests. The refactor also standardizes on Node.js 24 and implements "clean imports" using aliases.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript / Node.js 24 (LTS)
**Primary Dependencies**: `@repo/appwrite`, `@repo/config`, `tsx`, `zod`
**Storage**: Appwrite (Database, Storage)
**Testing**: Vitest (Unit, Integration, E2E)
**Target Platform**: Node.js Runtime
**Project Type**: CLI tool
**Performance Goals**: N/A (Admin utility)
**Constraints**: Appwrite rate limits, 100% type safety.
**Scale/Scope**: 4 Primary Modes, 11 Database Entities.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

src/
├── cli/                 # CLI parsing and bootstrap
│   └── MigratorCli.ts
├── core/                # Interfaces and shared domain logic
│   ├── BaseService.ts
│   └── types.ts
├── services/            # Implementation of migrator modes
│   ├── CheckService.ts
│   ├── MigrateService.ts
│   ├── SeedService.ts
│   └── TemplateService.ts
└── index.ts             # Tiny entry point

tests/
└── e2e/                 # High-level journey tests
    └── final-voyage.e2e.spec.ts

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## SOLID Mapping (Principle XIX)

- **Single Responsibility Principle (SRP)**: Each migrator mode is isolated into a dedicated service class (`SeedService`, `MigrateService`, etc.).
- **Interface Segregation Principle (ISP)**: `IMigratorService` provides a minimal contract for any mode orchestrator.
- **Dependency Inversion Principle (DIP)**: `MigratorCli` depends on the `IMigratorService` abstraction rather than concrete service implementations.

## Security Boundary Map (Principle XX)

- **Execution Context**: The `appwrite-migrator` is a CLI tool meant for administrative environments.
- **Data Mutation**: strictly handled within the CLI and executed via the `@repo/appwrite` package using server-side keys (API Key).
- **Access Control**: Relies on the `APPWRITE_API_KEY` provided via environment variables. No client-side (browser) data mutation occurs.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
