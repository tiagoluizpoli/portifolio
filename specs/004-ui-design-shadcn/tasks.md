# Tasks: Zenith Portfolio Hub (Phase 1)

## Phase 1: Setup & Infrastructure
- [ ] T001 Initialize `apps/zenith` with TanStack Start (RC) and Biome.
- [ ] T002 Update `@repo/appwrite-core` schema for `projects` and `analytics` collections.
- [ ] T003 [P] Configure Appwrite Collection permissions (Admin-only) for `projects` and `analytics`. [Spec §DR-006]

## Phase 2: Foundational Shell
- [ ] T004 Implement `AnalyticsRepository` in `packages/appwrite-core/src/repositories/`. [Principle VIII]
- [ ] T005 [P] Implement `ProjectRepository` in `packages/appwrite-core/src/repositories/`. [Principle VIII]
- [ ] T006 Implement `Sidebar` core component with Open/Compact/Mobile Sheet states in `apps/zenith/app/components/sidebar/`. [Spec §FR-008, §DR-001]
- [ ] T007 [P] Add `SidebarTrigger` and Breadcrumbs to the Global Topbar.
- [ ] T008 Setup `__root.tsx` layout with SidebarInset and high-density spacing. [Spec §DR-004]

## Phase 3: User Story 1 - Portfolio Analytics [US1]
**Goal**: Admin can monitor visitors, engagement, and geolocations from the main dashboard.
**Independent Test**: View `/` dashboard; verify KPI cards update and "Origin" list is populated.

- [ ] T009 [US1] Create `GetAnalyticsSummary` Use Case in `@repo/appwrite-core/src/use-cases/`.
- [ ] T010 [P] [US1] Implement 30s heartbeat tracking hook in `apps/zenith/app/lib/hooks/use-heartbeat.ts`. [Spec §FR-011]
- [ ] T011 [US1] Build symmetric KPI Cards (Visitors, Time, Projects) in `apps/zenith/app/routes/index.tsx`. [Spec §DR-005]
- [ ] T012 [P] [US1] Build "Visitor Origins" list with Country/State flags and density bars.
- [ ] T013 [US1] Implement **First-time UX** (Skeletons + Onboarding Guide) for empty analytics. [Spec §FR-019]

## Phase 4: User Story 2 - Portfolio Manager [US2]
**Goal**: Admin can CRUD portfolio projects with a Draft/Published lifecycle.
**Independent Test**: List, Create, and Edit a project in `/manager`; verify "Published" toggle state.

- [ ] T014 [US2] Implement Project CRUD Use Cases (Get, Create, Update) in `@repo/appwrite-core/src/use-cases/`.
- [ ] T015 [US2] Build Portfolio Manager Table with **Infinite Scroll** in `apps/zenith/app/routes/manager.tsx`. [Spec §FR-017]
- [ ] T016 [P] [US2] Create "Project Editor" Sheet with Draft/Published logic and explicit Save action. [Spec §FR-014]

## Phase 5: User Story 3 - System Settings [US3]
**Goal**: Admin can configure appearance and basic system parameters.
**Independent Test**: Navigate to `/settings`; update a config and verify it persists after refresh.

- [ ] T017 [US3] Build categorized Settings tabs (Appearance, System) in `apps/zenith/app/routes/settings.tsx`.
- [ ] T018 [P] [US3] Implement **Offline Indicator** (Badge/Toast) with "Last Cached" timestamp. [Spec §FR-018]

## Phase 6: Polish & Cross-Cutting
- [ ] T019 Final audit for **Global Row Symmetry** (`items-stretch`) across all Dashboard sections. [Spec §DR-005]
- [ ] T020 Optimize typography hierarchy and verify Command-K hierarchal search. [Spec §FR-013]
- [ ] T021 Run `pnpm biome check .` across all affected workspaces and verify < 200ms TBT. [Spec §FR-017]

## Dependencies & Parallel Execution
- **Setup Order**: Phase 1 → Phase 2 → Phase 3/4 (Parallel) → Phase 6.
- **Parallel Opps**: T003/T004 (Core setup), T010/T012 (Analytics details), T016/T018 (UI details).

## Implementation Strategy: MVP First
1. **MVP (Phase 1-3)**: Provide a functional, high-density dashboard with visitor analytics to establish the visual language.
2. **Incremental**: Add Portfolio Management (Phase 4) and Polish (Phase 6).
