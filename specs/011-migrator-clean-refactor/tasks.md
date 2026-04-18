# Tasks: Appwrite-Migrator Refactor

**Input**: Design documents from `/specs/011-migrator-clean-refactor/`
**Prerequisites**: [plan.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/011-migrator-clean-refactor/plan.md), [spec.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/011-migrator-clean-refactor/spec.md), [test-plan.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/011-migrator-clean-refactor/test-plan.md)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for Node 24 and asdf.

- [ ] T001 Create `.tool-versions` with Node 24 in `apps/appwrite-migrator/.tool-versions`
- [ ] T002 Update `engines` in `apps/appwrite-migrator/package.json` to strictly require Node 24
- [ ] T003 [P] Update `tsconfig.json` for extensionless imports in `apps/appwrite-migrator/tsconfig.json`
  - [ ] Configure `moduleResolution: "Bundler"`
  - [ ] Set `allowImportingTsExtensions: true`
- [ ] T004 [P] Configure path aliases `@/*` in `apps/appwrite-migrator/tsconfig.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the core architecture and contracts that all services will follow.

- [ ] T005 Define `MigratorContext` and `IMigratorService` in `apps/appwrite-migrator/src/core/types.ts`
- [ ] T006 Create `BaseService` abstract class in `apps/appwrite-migrator/src/core/BaseService.ts`
  - [ ] Implement standard logging helper
  - [ ] Implement generic error handling
- [ ] T007 Define shared seeding constants in `apps/appwrite-migrator/src/core/constants.ts`
  - [ ] Extract `SEED_TABLE_IDS` and `SEED_PAGE_SIZE`

---

## Phase 3: User Story 1 - Cognitive Load Reduction (Priority: P1) 🎯 MVP

**Goal**: Split the monolithic `index.ts` into a dedicated `MigratorCli` and specialized services.

**Independent Test**: Verify that each migrator command (`--seed`, `--migrate`, etc.) still executes correctly but is handled by distinct class instances.

### Epic: CLI Orchestration
- [ ] T008 [US1] Create unit test for `MigratorCli` in `apps/appwrite-migrator/src/cli/MigratorCli.spec.ts`
  - [ ] Test flag parsing logic
  - [ ] Test environment loading via `@repo/config`
- [ ] T009 [US1] Implement `MigratorCli` orchestration class in `apps/appwrite-migrator/src/cli/MigratorCli.ts`
  - [ ] Use `process.argv` and Zod to validate modes
  - [ ] Dispatch to correct service based on flags
  - [ ] T009.1 [US1] Unit test for `ConflictingMigratorCliFlagsError` in `MigratorCli.spec.ts`

### Epic: Service Migration
- [ ] T010 [US1] Create unit test for `CheckService` in `apps/appwrite-migrator/src/services/CheckService.spec.ts`
- [ ] T011 [US1] Implement `CheckService` in `apps/appwrite-migrator/src/services/CheckService.ts`
- [ ] T012 [US1] Create unit test for `MigrateService` in `apps/appwrite-migrator/src/services/MigrateService.spec.ts`
- [ ] T013 [US1] Implement `MigrateService` in `apps/appwrite-migrator/src/services/MigrateService.ts`
- [ ] T014 [US1] Create unit test for `SeedService` in `apps/appwrite-migrator/src/services/SeedService.spec.ts`
- [ ] T015 [US1] Implement `SeedService` in `apps/appwrite-migrator/src/services/SeedService.ts`
  - [ ] Implement `readSeedPayloadFromStorage`
  - [ ] Implement `buildExistingSeedState`
- [ ] T016 [US1] Create unit test for `TemplateService` in `apps/appwrite-migrator/src/services/TemplateService.spec.ts`
- [ ] T017 [US1] Implement `TemplateService` in `apps/appwrite-migrator/src/services/TemplateService.ts`

### Epic: Main Entry Point
- [ ] T018 [US1] Refactor `src/index.ts` to minimal bootstrap in `apps/appwrite-migrator/src/index.ts`
  - [ ] Reduce to < 50 lines of code

---

## Phase 4: User Story 2 - Standardized Imports (Priority: P2)

**Goal**: Enforce alias imports and remove all manual file extensions in source.

**Independent Test**: Build and typecheck the project; ensuring no `.js` or `.ts` extensions remain in internal imports.

- [ ] T019 [US2] Update all local imports in `src/services/` to use `@/` alias
- [ ] T020 [US2] Update all local imports in `src/cli/` to use `@/` alias
- [ ] T021 [US2] Update production build scripts in `package.json` to resolve/vendor extensionless imports if necessary
- [ ] T021.1 [US2] Run `typecheck` to ensure no broken extensionless resolution in `apps/appwrite-migrator/package.json`

---

## Phase 5: User Story 3 - Architectural Hardening (Priority: P1)

**Goal**: Ensure the refactor maintains 100% functional parity and zero regressions.

**Independent Test**: Complete the "Final Voyage" E2E journey successfully.

### Epic: Journey Verification
- [ ] T022 [US3] Move Journey tests to `apps/appwrite-migrator/tests/e2e/final-voyage.e2e.spec.ts`
- [ ] T023 [US3] Execute full test suite `pnpm test` and verify 100% pass rate

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T024 [P] Update `apps/appwrite-migrator/README.md` with new project structure
- [ ] T025 Performance audit: Verify `MigratorCli` instantiation time
- [ ] T026 Final code review for SOLID principles adherence

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** → **User Story 1 (Phase 3)**
- **User Story 2 & 3** depend on the core refactor in **User Story 1** being functional.

## Implementation Strategy

- **MVP First**: Complete `MigratorCli` and at least one core service (e.g., `CheckService`) to validate the new architecture.
- **Incremental**: Migrate services one by one, ensuring tests pass for each before moving to the next.
