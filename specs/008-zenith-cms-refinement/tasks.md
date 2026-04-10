# Tasks: Zenith CMS Refinement

**Feature Branch**: `008-zenith-cms-refinement`  
**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [test-plan.md](./test-plan.md)

This project is executed in isolated **Verification Rounds**. Each round must be completed and approved before starting the next.

## Phase 1: Infrastructure & Round 1 Foundation
**Goal**: Synchronize database schema and promote EN-source globalization.

- [ ] T001 [P] Remove `locale` and `level` fields from `Skill` domain model in `packages/appwrite-core/src/domain/cms/chapters/assets.ts`
- [ ] T002 [P] Purge `url` from `Solution` domain model in `packages/appwrite-core/src/domain/cms/chapters/assets.ts`
- [ ] T003 [P] Expand `ImpactMetric` entity with `internalCode`, `locale`, and `sourceKey` in `packages/appwrite-core/src/domain/cms/chapters/metrics.ts`
- [ ] T004 [P] Create `Platform` domain entity in `packages/appwrite-core/src/domain/cms/chapters/platforms.ts`
- [ ] T005 Update `SkillRepository` (Global) and `MetricRepository` (Semantic Parity) interfaces in `packages/appwrite-core/src/domain/repositories/interfaces.ts`
- [ ] T006 [P] Implement `PlatformRepository` in `packages/appwrite-core/src/infrastructure/repositories/platform.repository.ts`
- [ ] T007 Implement Migrator schema updates: Skills removal, Metric uniqueness index `(locale, internalCode)`, and Platforms collection in `apps/migrator/src/infrastructure/schema.manager.ts`
- [ ] T008 [TEST] [BE] Verify EN-source Skill globalization (TC-BE-001, TC-BE-005) in `packages/appwrite-core/__tests__/domain/skills.spec.ts`
- [ ] T009 [TEST] [BE] Verify Metric parity sync and uniqueness (TC-BE-003, TC-BE-004, TC-BE-006) in `packages/appwrite-core/__tests__/domain/metrics.spec.ts`

**Checkpoint**: Round 1 verification complete.

---

## Phase 2: Global Shell & Round 2 UI Identity
**Goal**: Transition to "Portfolio CMS" branding and routing partition.

- [ ] T010 [P] Global search/replace "Portfolio Manager" -> "Portfolio CMS" in `apps/zenith/app/locales/`
- [ ] T011 Update Sidebar and Nav labels in `apps/zenith/app/components/layout/sidebar.tsx`
- [ ] T012 [P] Create unified `CmsSaveButton` atomic component in `apps/zenith/app/features/cms/components/common/CmsSaveButton.tsx`
- [ ] T013 Update `use-maturity-audit.ts` to reflect the new Portfolio CMS naming and structure in `apps/zenith/app/features/cms/hooks/use-maturity-audit.ts`
- [ ] T014 [P] Refactor route structure to use `/portfolio-cms/` prefix in `apps/zenith/app/routes/` (directory restructure)
- [ ] T015 [TEST] [FE] Verify CMS routing partition and Navigation (TC-E2E-003) in `apps/zenith/tests/e2e/routing.spec.ts`

**Checkpoint**: Portfolio CMS Shell active.

---

## Phase 3: [US1] Global Skills & [US5] Solutions Grid (Round 3)
**Goal**: High-density list refactor and link/level removal.

- [ ] T016 [P] [US1] [US5] [TEST] [FE] Define interaction tests for Skills and Solutions grids (TC-FE-002, TC-FE-006, TC-FE-008).
- [ ] T017 [US1] Refactor Skill List to high-density grid (compact cards, no mastery) in `apps/zenith/app/routes/portfolio-cms/skills.tsx`
- [ ] T018 [US5] Refactor Solution List to card-based grid (purging all link UI) in `apps/zenith/app/routes/portfolio-cms/solutions.tsx`
- [ ] T019 [P] [US1] [US5] Integrate `IconPicker` for Skill and Solution thumbnails.
- [ ] T020 [P] [US1] [US5] Integrate `CmsSaveButton` and implement manual `TanStack Form v12+` refactor if code > 300 lines.

**Checkpoint**: Competencies and Solutions fully globalized/refactored.

---

## Phase 4: [US2] Semantic Metric Parity (Round 4)
**Goal**: Propagation of ghost rows and sync engine.

- [ ] T021 [US2] [TEST] [FE] Verify Metric dialog creation and Ghost-row propagation (TC-FE-003, TC-FE-004).
- [ ] T022 [US2] Implement `MetricSyncService` for "Ghost Row" creation logic across locales.
- [ ] T023 [US2] Refactor Metrics view to use the Dialog-driven creation flow (Manual vs Source) in `apps/zenith/app/routes/portfolio-cms/metrics.tsx`

**Checkpoint**: Impact Metrics parity system active.

---

## Phase 5: [US3] Home Split-Layout (Round 5)
**Goal**: 1:1 metadata and asset administration dashboard.

- [ ] T024 [P] [US3] [TEST] [FE] Verify 1:1 grid layout and Asset Previews (TC-FE-001, TC-FE-007, TC-FE-009).
- [ ] T025 [US3] Refactor Home Admin view to perfect 1:1 Split (Form Left, Media Right) in `apps/zenith/app/routes/portfolio-cms/home.tsx`
- [ ] T026 [US3] Replace Journey slider with spinner-free number input in the Form column.
- [ ] T027 [US3] Implement Picture and CV borderless preview windows in the Right column.

**Checkpoint**: Home Section verified in split-layout.

---

## Phase 6: [US4] Managed Platforms (Round 6)
**Goal**: Atomic side-drawer for platform CRUD.

- [ ] T028 [US4] [TEST] [FE] Verify Platform Drawer CRUD lifecycle (TC-FE-005).
- [ ] T029 [US4] Create `PlatformManagerDrawer` component in `apps/zenith/app/features/cms/components/platforms/PlatformDrawer.tsx`
- [ ] T030 [US4] Update Contact form's `PlatformSelect` to consume the managed Platforms collection.

**Checkpoint**: Managed platforms active.

---

## Final Phase: Polish & Quality Gate
- [ ] T031 [P] [TEST] [E2E] Execute Final E2E Journey (TC-E2E-001, TC-E2E-002, TC-E2E-004).
- [ ] T032 Run `pnpm guard` to ensure zero linting or type-safety errors.

## Implementation Strategy
- **MVP**: Completion of Phase 1 (Infra) and Phase 2 (Global Shell) provides the foundation.
- **Incremental**: Each Round serves as a complete feature increment.
- **Modular**: Tasks with [P] markers can be executed in parallel within their Phase.
