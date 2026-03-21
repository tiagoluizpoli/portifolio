# Tasks: Zenith Portfolio Hub (Phase 1)

## Phase 1: Setup & Infrastructure
- [ ] T001 Initialize `apps/zenith` with TanStack Start (RC) and Biome.
- [ ] T002 Update `@repo/appwrite-core` schema for `projects` and `analytics` collections.
- [ ] T003 [P] Create `AnalyticsRepository` in `packages/appwrite-core/src/repositories/`.
- [ ] T004 [P] Create `ProjectRepository` in `packages/appwrite-core/src/repositories/`.

## Phase 2: Foundational Shell
- [ ] T005 Implement `Sidebar` core component with "Open/Compact" states in `apps/zenith/app/components/sidebar/`.
- [ ] T006 [P] Add `SidebarTrigger` and Breadcrumbs to the Global Topbar.
- [ ] T007 Setup `__root.tsx` layout with SidebarInset, Topbar `Sheet` for mobile, and high-density spacing.
- [ ] T019 Configure Appwrite Collection permissions (Admin-only) for `projects` and `analytics`.

## Phase 3: User Story 1 - Analytics Dashboard [US1]
- [ ] T008 [US1] Create `GetAnalyticsSummary` Use Case in `@repo/appwrite-core`.
- [ ] T009 [P] [US1] Implement 30s heartbeat tracking hook in `apps/zenith/app/lib/hooks/use-heartbeat.ts`.
- [ ] T010 [US1] Build symmetric KPI Cards (Visitors, Time, Geo) in Dashboard index.
- [ ] T011 [US1] Build "Visitor Origins" list with Country/State flags and density bars.
- [ ] T012 [P] [US1] Implement "Real-time Activity" feed with polling.

## Phase 4: User Story 2 - Portfolio Manager [US2]
- [ ] T013 [US2] Implement Project CRUD Use Cases in `@repo/appwrite-core`.
- [ ] T014 [US2] Build Portfolio Manager Table with Infinite Scroll in `apps/zenith/app/routes/manager.tsx`.
- [ ] T015 [US2] Create "Project Editor" Sheet/Modal with Draft/Published logic.
- [ ] T020 [US1] Implement "Getting Started" Dashboard state for first-time users.
- [ ] T021 Implement Offline Toast/Badge with "Last Cached" timestamp logic.

## Phase 5: Polish & Governance
- [ ] T016 Apply Global Row Symmetry (`items-stretch`) across all Dashboard sections.
- [ ] T017 Final audit for "Zero PII" and "Private Utility" scope (Spec §DR-003).
- [ ] T018 Run `pnpm biome check .` across all affected workspaces.
