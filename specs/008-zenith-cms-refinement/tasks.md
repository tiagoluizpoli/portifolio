# Tasks: Zenith CMS Refinement

**Input**: Design documents from `/specs/008-zenith-cms-refinement/`
**Prerequisites**: plan.md (Round Strategy), spec.md (US1-US4), test-plan.md (Mandatory BE/FE/E2E)

**Organization**: Tasks are grouped into **Execution Rounds**. Each round MUST be completed and approved before proceeding to the next.

## Round 1: Infrastructure (Foundation)
**Purpose**: Synchronize database schema and core domain models. BLOCKS all subsequent rounds.

- [ ] T001 [P] Remove `locale` field from `Skill` interface in `packages/appwrite-core/src/domain/cms/chapters/assets.ts`
- [ ] T002 [P] Add semantic `internalCode` to `ImpactMetric` in `packages/appwrite-core/src/domain/cms/chapters/metrics.ts`
- [ ] T003 [P] Create `Platform` entity in `packages/appwrite-core/src/domain/cms/chapters/platforms.ts`
- [ ] T004 [P] Update `SkillRepository` to ignore locale in `packages/appwrite-core/src/infrastructure/repositories/implementation/appwrite-skill.repository.ts`
- [ ] T005 [P] Implement `PlatformRepository` in `packages/appwrite-core/src/infrastructure/repositories/implementation/appwrite-platform.repository.ts`
- [ ] T006 Update Migrator schema (Metrics uniqueness + Platforms collection) in `apps/migrator/src/infrastructure/schema.manager.ts`
- [ ] T007 Run migration and verify schema in Appwrite console
- [ ] T008 [P] [TEST] [BE] Verify Skill globalization logic (TC-BE-001) in `packages/appwrite-core/__tests__/domain/skills.spec.ts`
- [ ] T009 [P] [TEST] [BE] Verify Metric parity sync logic (TC-BE-003, TC-BE-004) in `packages/appwrite-core/__tests__/domain/metrics.spec.ts`

**Checkpoint**: Infrastructure ready - Round 1 must be approved.

---

## Round 2: Global Shell (Global UI)
**Purpose**: Establish standardized branding, routing, and shared UI atoms.

- [ ] T010 Rename "Portfolio Manager" references to "Portfolio CMS" in `apps/zenith/app/locales/en.json` and `pt.json`
- [ ] T011 Update NavHeader and Sidebar UI labels in `apps/zenith/app/components/layout/sidebar.tsx`
- [ ] T012 [P] Create atomic `CmsSaveButton` component in `apps/zenith/app/features/cms/components/common/CmsSaveButton.tsx`
- [ ] T013 Implement `/portfolio-cms/` route prefixing in `apps/zenith/app/routes` (Update file structure)
- [ ] T014 [TEST] [FE] Verify route prefixing and sidebar navigation (TC-E2E-003) in `apps/zenith/tests/e2e/routing.spec.ts`

**Checkpoint**: Global Shell ready - Round 2 must be approved.

---

## Round 3: Feature Section (Skills) - Priority: P1
**Goal Deliverable**: A single global skill list with a high-fidelity compact grid UI.

- [ ] T015 [P] [TEST] [FE] [US1] Verify Skill grid layout and responsiveness (TC-FE-002) in `apps/zenith/app/features/cms/__tests__/skills.spec.tsx`
- [ ] T016 [US1] Refactor Skills List to use the high-density grid and global fetch in `apps/zenith/app/routes/portfolio-cms/skills.tsx`
- [ ] T017 [US1] Integrate `CmsSaveButton` in Skills management view.

**Checkpoint**: Skills Section functional and verified.

---

## Round 4: Feature Section (Metrics) - Priority: P1
**Goal Deliverable**: Semantic linking, ghost-row parity, and dynamic data sources.

- [ ] T018 [P] [TEST] [FE] [US2] Verify Metric creation dialog toggles (TC-FE-003) in `apps/zenith/app/features/cms/__tests__/metrics.spec.tsx`
- [ ] T019 [US2] Implement `MetricSyncService` for parity propagation in `packages/appwrite-core/src/domain/services/metric-sync.service.ts`
- [ ] T020 [US2] Refactor Metrics page with creation dialog and sync logic in `apps/zenith/app/routes/portfolio-cms/metrics.tsx`
- [ ] T021 [US2] Implement "Ghost Row" visual differentiation in `apps/zenith/app/features/cms/components/metrics/MetricCard.tsx`

**Checkpoint**: Metrics Section functional and verified.

---

## Round 5: Feature Section (Home) - Priority: P2
**Goal Deliverable**: Split-layout 50/50 dashboard for landing page metadata and media previews.

- [ ] T022 [P] [TEST] [FE] [US3] Verify Home split-layout rendering at >1024px (TC-FE-001) in `apps/zenith/app/features/cms/__tests__/home.spec.tsx`
- [ ] T023 [US3] Refactor Home Admin page to use two-column grid in `apps/zenith/app/routes/portfolio-cms/home.tsx`
- [ ] T024 [US3] Implement high-ratio Image and borderless PDF preview components.

**Checkpoint**: Home Section functional and verified.

---

## Round 6: Feature Section (Platforms) - Priority: P2
**Goal Deliverable**: Managed branding side-drawer for social networks.

- [ ] T025 [P] [TEST] [FE] [US4] Verify Platform management drawer interactions (TC-FE-005) in `apps/zenith/app/features/cms/__tests__/platforms.spec.tsx`
- [ ] T026 [US4] Implement `PlatformManagerDrawer` in `apps/zenith/app/features/cms/components/platforms/PlatformDrawer.tsx`
- [ ] T027 [US4] Update `seed-cms.ts` to include initial Platform mappings in `apps/migrator/src/scripts/seed-cms.ts`

**Checkpoint**: Platform Management functional and verified.

---

## Final Round: Polish & E2E Verification
**Purpose**: Global quality gate compliance and rebranding validation.

- [ ] T028 [P] [TEST] [E2E] Run Playwright E2E: Rebranding verification (TC-E2E-001)
- [ ] T029 [TEST] [E2E] Run Playwright E2E: Metric Ghost-Row Sync Journey (TC-E2E-002)
- [ ] T030 Perform final `pnpm guard` stabilization pass across all affected workspaces.

---

## Dependencies & Execution Order

1. **Round 1 (Infra)**: BLOCKS all other rounds. MUST be approved first.
2. **Round 2 (Shell)**: Establishes the routing context for feature development.
3. **Rounds 3-6 (Features)**: Can technically proceed in parallel once Round 2 is complete, but user preference is for sequential approval.
4. **Final Round**: Depends on all previous Rounds being approved.

## Round Safeguards
- **UI Lockdown**: Once Round 2 is approved, no changes to the global sidebar or header allowed.
- **Round Isolation**: Subsequent rounds MUST NOT touch files approved in earlier rounds unless explicitly required for data linking.
- **Atomic Testing**: Each round MUST pass its specific `Vitest` or `Playwright` suite before being submitted for approval.
