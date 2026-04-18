# Tasks: Appwrite-Migrator Refactor

**Input**: Design documents from `/specs/011-migrator-clean-refactor/`
**Prerequisites**: [plan.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/011-migrator-clean-refactor/plan.md), [spec.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/011-migrator-clean-refactor/spec.md), [test-plan.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/011-migrator-clean-refactor/test-plan.md)

## Phase 1: Setup (Shared Infrastructure)

### Epic: Environment Standardization
- [x] T001 Create `.tool-versions` with Node 24 in `apps/appwrite-migrator/.tool-versions`
  - [x] Set `nodejs 24.x.x`
- [x] T002 Update `engines` in `apps/appwrite-migrator/package.json` to strictly require Node 24
- [x] T003 [P] Update `tsconfig.json` for extensionless imports in `apps/appwrite-migrator/tsconfig.json`
  - [x] Configure `moduleResolution: "Bundler"`
  - [x] Set `allowImportingTsExtensions: true`
  - [x] Set `module: "ESNext"`
- [x] T004 [P] Configure path aliases `@/*` in `apps/appwrite-migrator/tsconfig.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

### Epic: Core Architecture Definition
- [x] T005 Define Core Interfaces in `apps/appwrite-migrator/src/core/types.ts`
  - [x] Define `MigratorContext`
  - [x] Define `IMigratorService`
  - [x] Define `MigratorMode` union
- [x] T006 Create `BaseService` abstract class in `apps/appwrite-migrator/src/core/BaseService.ts`
  - [x] Implement `log(mode: string, message: string)`
  - [x] Define `abstract execute(context: MigratorContext): Promise<void>`
- [x] T007 [P] Define shared seeding constants in `apps/appwrite-migrator/src/core/constants.ts`
  - [x] Extract `SEED_TABLE_IDS`
  - [x] Extract `SEED_PAGE_SIZE`

---

## Phase 3: User Story 1 - Cognitive Load Reduction (Priority: P1) 🎯 MVP

**Goal**: Split the monolithic `index.ts` into a dedicated `MigratorCli` and specialized services.

### Epic: CLI Orchestration
- [x] T008 [US1] Create unit test for `MigratorCli` in `apps/appwrite-migrator/src/cli/MigratorCli.spec.ts`
  - [x] Verify flag detection (`--seed`, `--migrate`, etc.)
  - [x] Verify environment loading via `@repo/config`
  - [x] Verify error handling for missing variables
- [x] T009.1 [US1] Unit test for `ConflictingMigratorCliFlagsError` in `MigratorCli.spec.ts`
- [x] T009 [US1] Implement `MigratorCli` orchestration class in `apps/appwrite-migrator/src/cli/MigratorCli.ts`
  - [x] Implement `buildContext(argv)`
  - [x] Implement `run()` with service dispatching logic

### Epic: Service Migration (Application Layer)
- [x] T010 [US1] Create unit test for `CheckService` in `apps/appwrite-migrator/src/services/CheckService.spec.ts`
- [x] T011 [US1] Implement `CheckService` in `apps/appwrite-migrator/src/services/CheckService.ts`
  - [x] Wrap `migrationService.calculateStructuralDelta()`
- [x] T012 [US1] Create unit test for `MigrateService` in `apps/appwrite-migrator/src/services/MigrateService.spec.ts`
- [x] T013 [US1] Implement `MigrateService` in `apps/appwrite-migrator/src/services/MigrateService.ts`
  - [x] Wrap `migrationService.migrate()`
- [x] T014 [US1] Create unit test for `SeedService` in `apps/appwrite-migrator/src/services/SeedService.spec.ts`
- [x] T015 [US1] Implement `SeedService` in `apps/appwrite-migrator/src/services/SeedService.ts`
  - [x] Port `readSeedPayloadFromStorage` from `index.ts`
  - [x] Port `buildExistingSeedState` from `index.ts`
  - [x] Port `runSeedMode` logic into `execute()`
- [x] T016 [US1] Create unit test for `TemplateService` in `apps/appwrite-migrator/src/services/TemplateService.spec.ts`
- [x] T017 [US1] Implement `TemplateService` in `apps/appwrite-migrator/src/services/TemplateService.ts`
  - [x] Port `runTemplateMode` logic into `execute()`

### Epic: Main Entry Point (Bootstrap)
- [x] T018 [US1] Refactor `src/index.ts` to minimal bootstrap in `apps/appwrite-migrator/src/index.ts`
  - [x] Instantiate `MigratorCli`
  - [x] Call `cli.run()`
  - [x] Catch global errors and set `process.exitCode`

---

## Phase 4: User Story 2 - Standardized Imports (Priority: P2)

### Epic: Import Hygiene
- [x] T019 [US2] Update all local imports in `src/services/` to use `@/` alias
- [x] T020 [US2] Update all local imports in `src/cli/` to use `@/` alias
- [x] T021 [US2] Update production build scripts in `package.json` to support extensionless imports
- [x] T021.1 [US2] Run `typecheck` to ensure no broken extensionless resolution in `apps/appwrite-migrator/package.json`

---

## Phase 5: User Story 3 - Architectural Hardening (Priority: P1)

### Epic: Journey Verification
- [x] T022 [US3] Move Journey tests to `apps/appwrite-migrator/tests/e2e/final-voyage.e2e.spec.ts`
- [x] T023 [US3] Execute full test suite `pnpm test` and verify 100% pass rate in both local and CI environments

---

## Phase 6: User Story 4 - Infrastructure Leakage Isolation (Priority: P1)

**Goal**: Purge Appwrite SDK primitives out of the Application layer interfaces.

### Epic: Repository Interface Decoupling
- [x] T027 [US4] Define `RepositoryQueryOptions` with `{ limit?: number, offset?: number }` in `packages/appwrite/src/repositories/interfaces.ts`.
- [x] T028 [US4] Define Zod schema `repositoryQueryOptionsSchema` to enforce type safety natively.
- [x] T029 [US4] Create `InvalidRepositoryQueryError` in `packages/appwrite/src/errors/appwrite-errors.ts`.
- [x] T030 [US4] Update `IRepository.findMany` to accept `options?: RepositoryQueryOptions`.

### Epic: Base Repository Hardening
- [x] T031 [US4] Parse incoming `options` against schema in `base-repository.ts::findMany()`.
- [x] T032 [US4] Map validation errors to `InvalidRepositoryQueryError`.
- [x] T033 [US4] Construct `Query.limit` and `Query.offset` from validated options.
- [x] T034 [US4] Update `base.spec.ts` matching validations for the new logic.

### Epic: Application Service Isolation
- [x] T035 [US4] Purge `import { Query }` from `packages/appwrite/src/services/seed-engine.ts`.
- [x] T036 [US4] Update `SeedEngine.listAllRows` pagination to pass objects.
- [x] T037 [US4] Update `seed-engine.spec.ts` mocks formatting.
- [x] T038 [US4] Purge `import { Query }` from `packages/appwrite/src/services/storage.ts`.
- [x] T039 [US4] Align `StorageService` query construction tightly.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [x] T024 [P] Update `apps/appwrite-migrator/README.md` with new project structure
- [x] T025 Performance audit: Verify `MigratorCli` instantiation time
- [x] T026 Final code review for SOLID principles adherence (SRP, ISP, DIP)
- [ ] T040 Rerun `pnpm typecheck` to verify monorepo typings stability across all refactored implementations.

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** → **User Story 1 (Phase 3)**
- **User Story 2 & 3** depend on the core refactor in **User Story 1** being functional.

## Implementation Strategy

- **MVP First**: Complete `MigratorCli` and `CheckService` to validate the new architecture.
- **Incremental**: Migrate services one by one, ensuring tests pass for each before moving to the next.
