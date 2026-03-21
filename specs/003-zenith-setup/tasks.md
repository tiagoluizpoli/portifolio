# Tasks: Zenith Setup

**Input**: Design documents from `/specs/003-zenith-setup/`
**Prerequisites**: plan.md, spec.md, zenith_guidelines_2026.md

## Phase 1: Setup (Shared Infrastructure)
**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Zenith app in `apps/zenith` using `pnpm dlx create-tanstack-start@latest`
- [x] T001.1 Create `apps/zenith/.env.example` with public (VITE_) and secret (APPWRITE_API_KEY) variables
- [x] T002 [P] Configure `apps/zenith/app.config.ts` using `defineConfig` from `@tanstack/react-start/config`
- [x] T003 [P] Configure `apps/zenith/package.json` with React 19, Tailwind v4, and Zod dependencies
- [x] T004 [P] [US2] Setup `apps/zenith/src/index.css` using Tailwind v4 and OKLCH @theme tokens
- [x] T005 [P] [US2] Initialize Shadcn UI in `apps/zenith` using `pnpm dlx shadcn@latest init -t start --monorepo`
- [x] T006 [P] Ensure Biome-only linting (delete any `.eslintrc.json`, `.prettierrc` in `apps/zenith`)

---

## Phase 2: Foundational (Blocking Prerequisites)
**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

- [x] T007 [P] Implement `apps/zenith/src/components/client-only.tsx` and `use-hydrated.ts` hook
- [x] T008 [P] Implement `apps/zenith/src/config/env.ts` for fail-fast (presence/format only) validation
- [x] T009 [P] Implement `apps/zenith/src/routes/error/startup.tsx` with missing var links to documentation
- [x] T010 [P] Create `apps/zenith/src/routes/__root.tsx` with metadata hoisting and global styles
- [x] T011 [P] Define shared Domain Interfaces using **Zod schemas** in `packages/appwrite-core/src/domain/repositories/`
- [x] T012 [P] Implement Standardized Exceptions in `packages/appwrite-core/src/domain/exceptions/`
- [x] T013 Implement AppWrite Repositories using Zod-driven mapping logic and **`TablesDB`** in Core

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Type-Safe Full-Stack Foundation (Priority: P1) 🎯 MVP
**Goal**: Establish the base for a fully initialized TanStack Start project with secure serverCap.

**Independent Test**: Running `pnpm dev` in `apps/zenith` shows the dashboard with working SSR and no hydration errors.

- [x] T014 [US1] Implement `apps/zenith/src/infrastructure/appwrite/server.ts` server functions with Zod validation and **`TablesDB` transactional logic**
- [x] T015 [US1] Create a sample safe route in `apps/zenith/src/routes/index.tsx` to verify end-to-end SSR
- [x] T016 [US1] Verify `pnpm dev` starts and dashboard load without errors

---

## Phase 4: User Story 2 - Modern Styling Foundation (Priority: P2)
**Goal**: Integrate Shadcn UI with Tailwind CSS v4 using modern React 19 patterns.

**Independent Test**: Shadcn Button renders with OKLCH theme tokens and zero ref-passing warnings.

- [x] T017 [P] [US2] Add a sample Shadcn component (e.g., Button) to `apps/zenith/src/routes/index.tsx`
- [x] T018 [US2] Verify component renders correctly with OKLCH theme tokens and React 19 ref passing

---

## Phase 5: User Story 3 - Secure Server Environment (Priority: P1)
**Goal**: Ensure AppWrite secrets are never leaked to the client bundle.

**Independent Test**: Grep audit of client JS bundle returns zero results for secret environment variables.

- [x] T019 [US3] Implement dummy `createServerFn` in `apps/zenith/src/infrastructure/appwrite/server.ts` to test secret isolation
- [x] T020 [US3] Verify `APPWRITE_API_KEY` is inaccessible in client-side bundle via manual/grep audit

---

## Phase 6: Polish & Cross-Cutting Concerns
**Purpose**: Final verification and security hardening

- [x] T021 [P] **Security Audit (SC-004)**: Final grep-based audit of client-side JS bundle for secret leaks
- [x] T022 [P] Final Biome lint and Typecheck across Zenith and AppWrite Core
- [x] T023 [P] **Exhaustive Guideline Creation**: Generate 1000+ line monolithic TanStack Start Developer Bible [x]
- [x] T024 [P] **Speckit Analysis**: Perform cross-artifact audit and reconcile gaps [x]

---


## Phase 7: Advanced Reliability (FR-015)
**Purpose**: Implement transactional integrity via rollbacks

- [x] T025 [US1] Implement a sample multi-step service (e.g., Create Project + Log Audit) in Core.
- [x] T026 [US1] Implement explicit `rollback` logic in the service layer to undo successful steps if subsequent ones fail.
- [x] T027 [US1] Unit test failure scenarios to verify that partial state is cleaned up.
- [x] T028 [US1] [FR-010] Implement "Exception Cross-Check" test verifying that Appwrite core exceptions hydrate correctly as user-friendly UI errors.

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 completion.
- **User Stories (Phase 3-5)**: Depends on Phase 2 completion.
- **Polish (Phase 6)**: Depends on all stories completion.

### Parallel Opportunities
- All Setup tasks marked [P] can run in parallel.
- All Foundational tasks marked [P] can run in parallel.
- T017 (Sample UI) can run in parallel with T014 (Server Logic).

---

## Implementation Strategy
### MVP First
1. Complete Phases 1 & 2 to establish the foundation.
2. Complete US1 to verify full-stack type safety.
3. Validate and document.
