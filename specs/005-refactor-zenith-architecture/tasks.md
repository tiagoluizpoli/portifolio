---
description: "Task list for Refactoring Zenith Architecture"
---

# Tasks: Refactoring Zenith Architecture

**Input**: Design documents from `/specs/005-refactor-zenith-architecture/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize workspace context by reading `apps/zenith/.env` and `apps/zenith/package.json` for Zenith refactoring

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

*(No blocking primitives required across the three stories; they isolate efficiently into Bootloader vs Context Manager vs UI components).*

---

## Phase 3: User Story 1 - Resilient Startup Validation (Priority: P1) 🎯 MVP

**Goal**: Implement a fail-fast startup sequence that intercepts `.env` parsing errors to prevent Node process crashes, serving a static diagnostic screen.

**Independent Test**: Remove `APPWRITE_API_KEY` from `.env`. Run the dev server. Access `localhost:5173` to see the static "Startup Configuration Error" instead of a 502/Proxy crash.

### Implementation for User Story 1

- [X] T002 [US1] Create a highly reliable static HTML/minimal JS startup error component fallback (e.g., `apps/zenith/app/error-interceptor.tsx` or directly in `entry-server.tsx`).
- [X] T003 [US1] Refactor `apps/zenith/app/config/env.ts` to defer Zod exceptions using `safeParse` or `SKIP_ENV_VALIDATION` bypass logic to evaluate gracefully.
- [X] T004 [US1] Update `apps/zenith/app/entry-server.tsx` to wrap router execution in a global try/catch acting as a bootloader for validation errors.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Transactional Integrity & Rollbacks (Priority: P1)

**Goal**: Wrap all multi-step AppWrite actions into a centralized Transaction Manager context for LIFO state compensation.

**Independent Test**: Mock an invalid step 2 in `createServerFn` and observe the rollback hooks for step 1 successfully resolving.

### Implementation for User Story 2

- [X] T005 [P] [US2] Implement `ITransactionManager` contract and core class in `packages/appwrite-core/src/transactions/TransactionManager.ts`.
- [X] T006 [P] [US2] Implement shared Zod payload schemas in `@repo/appwrite-core/src/models/` for Portfolio mutation boundaries.
- [X] T007 [US2] Refactor `apps/zenith/app/infrastructure/appwrite/server.ts` to wrap RPC mutations using the `TransactionManager` context (depends on T005, T006).

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Scalable Route Orchestrators (Priority: P2)

**Goal**: Extract massive presentation/UI arrays and logic out of `routes/index.tsx` to obey the orchestrator structure limits (< 100 LoC).

**Independent Test**: Validate `routes/index.tsx` is < 100 LoC using `wc -l`, and the dashboard renders flawlessly on runtime.

### Implementation for User Story 3

- [X] T008 [P] [US3] Create Temporal Density Chart component in `apps/zenith/app/features/dashboard/components/temporal-density.tsx`.
- [X] T009 [P] [US3] Create KPI Snapshot component in `apps/zenith/app/features/dashboard/components/kpi-cards.tsx`.
- [X] T010 [P] [US3] Create Geographic Ingress Table component in `apps/zenith/app/features/dashboard/components/geo-distribution.tsx`.
- [X] T011 [US3] Extract data hooks and arrays (like `kpiCards`, `regions`, `sparklineData`) from `apps/zenith/app/routes/index.tsx` into a central `useDashboardModel` hook inside `features/dashboard/hooks/`.
- [X] T012 [US3] Refactor `apps/zenith/app/routes/index.tsx` to operate STRICTLY as an orchestrator importing the UI fragments.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T013 [P] Execute `pnpm guard` to enforce quality gate.
- [X] T014 Audit `apps/zenith/app/infrastructure/appwrite/server.ts` for remaining duplicated Zod `.object()` definitions.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: N/A.
- **User Stories (Phase 3+)**: US1, US2, and US3 modify completely independent files and can run safely in parallel.
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Independent execution (boot sequence).
- **User Story 2 (P1)**: Independent execution (RPC orchestration).
- **User Story 3 (P2)**: Independent execution (frontend refactor).

### Parallel Opportunities

- T008, T009, T010 can be safely generated concurrently by agents extracting JSX from the original file.
- T005 and T006 can be executed concurrently in `@repo/appwrite-core`.
