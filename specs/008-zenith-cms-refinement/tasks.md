# Tasks: Zenith CMS Refinement

**Feature Branch**: `008-zenith-cms-refinement`  
**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [test-plan.md](./test-plan.md), [tests/*.md](./tests/)

This project is executed in isolated **Verification Rounds**. Each round must be completed and approved before starting the next.

## Phase 1: Infrastructure & Round 1 Foundation
**Goal**: Synchronize database schema and promote EN-source globalization.

- [x] T001 [P] Remove `locale` and `level` fields from `Skill` domain model.
- [x] T002 [P] Purge `url` from `Solution` domain model.
- [x] T003 [P] Expand `ImpactMetric` entity with `internalCode`, `locale`, and `sourceKey`.
- [x] T004 [P] Create `Platform` domain entity.
- [x] T005 Update Repository interfaces in `packages/appwrite-core`.
- [x] T006 [P] Implement `PlatformRepository`.
- [x] T007 Implement Migrator schema updates (Skills, Metrics, Platforms).
- [x] T008 [TEST] [BE] Verify EN-source Skill globalization (TC-BE-001).
- [x] T009 [TEST] [BE] Verify Metric parity sync and uniqueness (TC-BE-003, TC-BE-004).

**Checkpoint**: Round 1 verification complete.

---

## Phase 2: Global Shell & Round 2 UI Identity
**Goal**: Transition to "Portfolio CMS" branding and routing partition.

- [x] T010 [P] Global search/replace "Portfolio Manager" -> "Portfolio CMS".
- [x] T011 Update Sidebar and Nav labels.
- [x] T012 [P] Create unified `CmsSaveButton` atomic component.
- [x] T013 Update `use-maturity-audit.ts` naming.
- [x] T014 [P] Refactor route structure to use `/portfolio-cms/` prefix.
- [x] T015 [TEST] [FE] Verify CMS routing partition and Navigation.
- [x] T016 [P] Implement and integrate `CmsDiscardButton`.

**Checkpoint**: Portfolio CMS Shell active.

---

## Phase 3: [US1] Global Skills (Round 3)
**Goal**: High-density grid refactor for globalized skills.

- [x] T017 [US1] Refactor Skill List to Read-Only high-density grid.
- [x] T018 [US1] Implement `SkillDialog` for Add/Edit lifecycle.
- [x] T019 [P] [US1] Integrate `IconPicker` inside Dialog.

**Checkpoint**: Global Skills refactored.

---

## Phase 4: [US5] Solutions Grid (Round 4)
**Goal**: Professional solutions grid without URLs.

- [x] T020 [US5] Refactor Solution List to Read-Only card grid.
- [x] T021 [US5] Implement `SolutionDialog` with `IconPicker` integration.

**Checkpoint**: Solutions Grid active.

---

## Phase 5: [US2] Semantic Metric Parity (Round 5)
**Goal**: Propagation of ghost rows and source-driven identity.

- [x] T022 [US2] [TEST] [BE] Verify Metric parity engine (Happy Path + Ghost Rows): TS-BE-001, TS-BE-002, TS-BE-003.
- [x] T023 [US2] [TEST] [BE] Verify Metric uniqueness and validation: TS-BE-007, TS-BE-008.
- [x] T024 [P] [INFRA] Seed persistent `manual` Source record and implement Source -> Metric cascade in `packages/appwrite-core`.
- [x] T025 [US2] Implement `MetricSyncService` for "Ghost Row" creation logic with atomic rollback safety (TS-BE-009).
- [x] T026 [US2] [TEST] [FE] Verify `useMetricNormalizer` icon override logic: TS-FE-001, TS-FE-002, TS-FE-005.
- [x] T027 [US2] [TEST] [FE] Verify `MetricDialog` input locking/clearing: TS-FE-003, TS-FE-004, TS-FE-008.
- [x] T028 [US2] Implement `useMetricNormalizer` hook in `apps/zenith`.
- [x] T029 [US2] Refactor Metrics view to use the Dialog-driven creation flow.

**Checkpoint**: Impact Metrics parity system active.

---

## Phase 6: [US3] Home Split-Layout (Round 6)
**Goal**: 1:1 metadata and asset administration dashboard.

- [ ] T030 [US3] [TEST] [FE] Verify Split Grid responsiveness and input spinners: TS-FE-001, TS-FE-003, TS-FE-004.
- [ ] T031 [US3] [TEST] [INT] Verify Asset Preview rendering for Picture and CV: TS-INT-001, TS-INT-002.
- [ ] T032 [US3] Refactor Home Admin view to perfect 1:1 Split.
- [ ] T033 [STYLE] Implement global `.no-spinner` utility in `apps/zenith/app/styles/index.css`.
- [ ] T034 [US3] Implement high-fidelity Asset Uploader with drag-and-drop and progress bars.
- [ ] T035 [US3] Implement Picture and CV borderless preview windows within scrollable viewport.

**Checkpoint**: Home Section verified in split-layout.

---

## Phase 7: [US4] Managed Platforms (Round 7)
**Goal**: Atomic side-drawer for platform CRUD.

- [ ] T033 [US4] [TEST] [FE] Verify Platform Drawer CRUD lifecycle: TS-FE-001, TS-FE-002, TS-FE-006.
- [ ] T034 [US4] [TEST] [INT] Verify Consumer Sync (Contact Form updates): TS-INT-001, TS-INT-002.
- [ ] T035 [US4] Create `PlatformManagerDrawer` component with `IconPicker` integration.
- [ ] T036 [US4] Update Contact form to consume the managed Platforms collection.

**Checkpoint**: Managed platforms active.

---

## Final Phase: Polish & Quality Gate
- [x] T037 Run `pnpm guard` to ensure zero linting or type-safety errors.
- [ ] T038 Execute Final E2E Journey (TC-E2E-001, TC-E2E-002).
