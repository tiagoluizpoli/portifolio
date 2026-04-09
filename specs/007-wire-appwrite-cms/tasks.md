# 🧩 Task Breakdown: Zenith CMS Appwrite Wiring

**Feature**: `007-wire-appwrite-cms` | **Implementation Strategy**: Incremental Section Implementation (Setup -> Foundational -> US1-7)

## Phase 1: Setup & Dependency Sync
- [ ] T001 Synchronize `@tanstack/*` package versions to `latest` RC in `packages/appwrite-core` and `apps/zenith`
- [ ] T002 Ensure `Biome` is configured and passing for the `appwrite-core` package

## Phase 2: Foundational (Data Layer & Infrastructure)
- [ ] T003 Update `SchemaManager` in `apps/migrator/src/infrastructure/schema.manager.ts` to include `metric_sources`, `about`, and normalized `impact_metrics`
- [ ] T004 Define CMS repository interfaces in `packages/appwrite-core/src/domain/repositories/interfaces.ts`
- [ ] T005 [P] Implement `HomeRepository` in `packages/appwrite-core/src/infrastructure/repositories/home.repository.ts` with split identity mapping
- [ ] T006 [P] Implement `MetricSourceRepository` and `MetricRepository` in `packages/appwrite-core` to handle normalized impact data
- [ ] T007 [P] Implement `HistoryRepository` in `packages/appwrite-core` with specific column mapping for Experience/Education
- [ ] T008 [P] Implement `SkillRepository` with `status` lifecycle support and type/category mapping
- [ ] T009 [P] Implement `SolutionRepository` with nullable `url` support
- [ ] T010 [P] Implement `ContactRepository` with row-to-object transformation logic for `contact_info` table
- [ ] T011 Create shared CMS Zod schemas in `packages/appwrite-core/src/models/cms.ts`
- [ ] T011.1 Create initial mock seed data for `about`, `metrics`, and `metric_sources` in the migrator

## Phase 3: [US1] Core CMS Orchestration (P1)
**Goal**: Wire the global context to TanStack Query and Server Functions.
**Independent Test**: Refresh Zenith CMS and see the "Maturity Audit" calculate based on actual Appwrite data (even if empty).

- [ ] T012 [US1] Create `apps/zenith/app/features/cms/services/cms.service.ts` as the primary application service
- [ ] T013 [US1] Implement `createServerFn` RPC endpoints in `apps/zenith/app/infrastructure/appwrite/server.ts` for all CMS sections
- [ ] T014 [US1] Refactor `apps/zenith/app/features/cms/context/cms-context.tsx` to use TanStack Query hooks

## Phase 4: [US2] Home Section Wiring (P1)
**Goal**: Persist split identity and asset identifiers.
**Independent Test**: Change `firstName` and `journeyStartedIn`, save, and verify in Appwrite Console.

- [ ] T015 [P] [US2] Update `HomeData` interface in `apps/zenith/app/features/cms/types/home.ts` to match DB identity fields
- [ ] T016 [US2] Refactor `apps/zenith/app/features/cms/components/sections/home-form.tsx` to use `TanStack Form`
- [ ] T017 [US2] Connect `HomeForm` to `useMutation` for persistence

## Phase 5: [US3] About & Impact Metrics (P1)
**Goal**: Persist narrative content and normalized metrics with sources.
**Independent Test**: Add a metric, select a source (e.g. GitHub), save, and verify the `sourceId` foreign key.

- [ ] T018 [P] [US3] Define `AboutData` and `Metric` domain types in `apps/zenith/app/features/cms/types/about.ts`
- [ ] T019 [US3] Implement narrative form and `ImpactMetrics` dynamic list in `about-form.tsx`

## Phase 6: [US4] Experience & Education (P2)
**Goal**: Persist career/academic history using semantic column names.
**Independent Test**: Create an experience item, save, and verify `position` and `company` columns in DB.

- [ ] T020 [P] [US4] Refactor `HistoryItem` and related types to semantic names in `apps/zenith/app/features/cms/types/history.ts`
- [ ] T021 [US4] Update `experience-form.tsx` and `education-form.tsx` to use `TanStack Form` and the new schema

## Phase 7: [US5] Skills & Solutions (P2)
**Goal**: Persist competence and offerings with icon overrides and external links.
**Independent Test**: Toggle "External Link" in a solution and verify the `url` field becomes mandatory/persisted.

- [ ] T022 [P] [US5] Update `Skill` and `Solution` types in `apps/zenith/app/features/cms/types/assets.ts`
- [ ] T023 [US5] Implement `status` toggle in `skills-form.tsx` and conditional `url` in `solutions-form.tsx`

## Phase 8: [US6] Contact & Socials (P3)
**Goal**: Persist row-based contact data transformed from a single form.
**Independent Test**: Update "Email", save, and verify exactly ONE row in `contact_info` table with type `email` is updated.

- [ ] T024 [P] [US6] Define `ContactData` form schema and transformation logic
- [ ] T025 [US6] Implement `contact-form.tsx` (consolidating Info and Socials) using `TanStack Form`

## Phase 9: Polish & Quality Gate
- [ ] T026 Audit all components for `Biome` linting and type-safety (`pnpm guard`)
- [ ] T027 Verify EN/PT locale switching ensures independent document references for all sections

## Dependencies
- Phase 2 (Foundational) MUST be completed before any User Story wiring.
- US1 (Orchestration) MUST be completed before section-specific wiring.

## Implementation Strategy
1. **MVP**: Complete Phase 2 and US1 + US2 (Home). This proves the end-to-end repository-to-RPC-to-UI pipeline.
2. **Incremental**: Follow with US3, US4, US5, US6 sequentially.
3. **Parallel**: Repository implementations (T005-T010) and Type updates (T015, T018, T020) can be done in parallel.
