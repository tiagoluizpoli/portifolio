# Tasks: Appwrite-Migrator Refactor (Hardened Architecture)

**Input**: Design documents from `/specs/011-migrator-clean-refactor/`
**Prerequisites**: [plan.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/011-migrator-clean-refactor/plan.md), [spec.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/011-migrator-clean-refactor/spec.md)

---

## Epic: Shared Infrastructure & Setup
- [x] T001 Standardize Runtime & Workspace
    - [x] Update `package.json` to Node 24 (LTS).
    - [x] Configure `pnpm` workspace scripts for migrator execution.
- [x] T002 Initialize Directory Structure
    - [x] Create `src/cli`, `src/core`, `src/services`, and `src/tests`.
    - [x] Setup co-located `.spec.ts` patterns in `src/`.
- [x] T003 Configure Domain Aliases
    - [x] Setup `@/*` absolute path aliases in `tsconfig.json`.

---

## Epic: Foundational Abstractions (Blocking)
- [x] T004 Implement `BaseService` Anchor
    - [x] Define abstract `execute()` contract.
    - [x] Implement shared context and logging injection.
- [x] T005 Define Domain Types & Interfaces
    - [x] Centralize `DeltaStatus`, `MigrationPlan`, and `SeedPayload` logic in `src/core/types.ts`.
    - [x] Standardize mode enums.
- [x] T006 Implement Core Infrastructure Contracts in `@repo/appwrite`.

---

## Epic: CLI Orchestration (User Story 1)
- [x] T007 Implement `MigratorCli` Orchestrator
    - [x] Initialize `commander` instance.
    - [x] Map CLI subcommands (seed, check, migrate, template) to service classes.
- [x] T008 [P] Implement Main Entry Point Refactor
    - [x] Reduce `src/index.ts` to a minimal bootstrap (< 80 lines).
    - [x] Delegate all execution to `MigratorCli.run()`.

---

## Epic: Standardized Path Resolution (User Story 2)
- [x] T009 [P] Bulk Migration to Alias Imports
    - [x] Update all internal imports to `@/` aliases.
- [x] T010 [P] Purge Import Extensions
    - [x] Remove `.js` and `.ts` extensions from local import strings.
    - [x] Configure `tsx` to handle extensionless resolution natively.

---

## Epic: Infrastructure Isolation & Hardening (User Story 3)
- [x] T011 Implement `QueryMapper` in Repository Layer
    - [x] Create safe wrapper for Appwrite `Query` primitives.
- [x] T012 [P] Refactor `BaseRepository`
    - [x] Purge direct SDK builder usage.
- [x] T013 [P] Refactor `StorageService`
    - [x] Extract file naming logic into the core domain.
- [x] T014 Verification Gate
    - [x] Ensure zero `import { Query }` leaks in the application services.
    - [x] Verify 100% pass rate on `pnpm guard`.

---

## Epic: Structural Decomposition (SRP Enforcement - Current Phase)
**Goal**: Break down "God Classes" and God Test Suites into atomic services.

### T048 [US5] Extract `SeederValidator`
- [x] Move Zod row-level validation.
- [x] Move `validateApiLevelConstraints` logic.
- [x] Implement unit tests for validator.

### T049 [US5] Extract `SeederPlanner`
- [x] Move `buildUpsertPlan` logic.
- [x] Move deduplication signature calculation.
- [x] Implement unit tests for planner.

### T050 [US5] Extract `SeederExecutor`
- [x] Move `executeUpsertPlan` transactional loop.
- [x] Implement retry and rate-limiting logic.
- [x] Implement unit tests for executor.

### T051 [US5] Extract `TemplateGenerator`
- [x] Move `generateTemplateArtifacts` and Markdown logic.
- [x] Implement unit tests for generator.

### T052 [US5] Extract `SchemaComparator` utility
- [x] Port logic for table/column/index difference calculation from DestructiveOfficer.
- [x] Ensure `DestructiveOfficer.ts` adheres to **Principle VIII** (< 300 lines).
- [x] Implement unit tests for comparator.

---

## Epic: High-Fidelity Type Safety (Domain Integrity)
**Goal**: Enforce branded types and purge all "unsafe" casts.

### T053 [US6] Define Domain Branded Types in `packages/appwrite-core`
- [x] Implement `TableId`, `BucketId`, `FileId` brands.

### T054 [US6] Refactor Infrastructure to use Branded Types
- [x] Propagate brands through `BaseRepository` and `StorageService`.

### T055 [US6] Purge Legacy Unsafe Casts
- [x] Replace `as unknown as ExistingSeedState` with safe mappers.
- [x] Fix unsafe casts in `MigratorCli.spec.ts`.
- [x] Fix `row as Record<string, unknown>` in seeder services.

---

## Epic: CLI Configuration Hardening (Security)
**Goal**: Zero-trust schema-driven flag validation.

### T056 [US7] Implement `cliConfigSchema` using Zod
- [x] Integrate `Commander.js` for flag extraction.
- [x] Pass raw flags into `cliConfigSchema` for strict validation.
- [x] Implement strict rejection of unrecognized or conflicting flags.

---

## Epic: Final Quality Gate
- [x] T057 [P] Final Monorepo Certification
    - [x] Rerun `pnpm guard` with 100% coverage target.
    - [x] Verify `spec.md` and `plan.md` alignment with final source code.
