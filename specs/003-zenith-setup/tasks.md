# Tasks: Zenith Setup

**Input**: Design documents from `/specs/003-zenith-setup/`
**Prerequisites**: plan.md, spec.md, zenith_guidelines_2026.md

## Phase 1: Setup (Shared Infrastructure)
**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Zenith app in `apps/zenith` using `pnpm dlx create-tanstack-start@latest`
- [ ] T002 [P] Configure `apps/zenith/app.config.ts` using `defineConfig` from `@tanstack/react-start/config`
- [ ] T003 [P] Configure `apps/zenith/package.json` with React 19 and Tailwind v4 dependencies
- [ ] T004 [P] Setup `apps/zenith/src/index.css` with Tailwind v4 `@import "tailwindcss";` and `@theme`
- [ ] T005 [P] Initialize Shadcn UI in `apps/zenith` using `pnpm dlx shadcn@latest init -t start --monorepo`
- [ ] T006 [P] Ensure Biome-only linting (delete any `.eslintrc.json`, `.prettierrc` in `apps/zenith`)

---

## Phase 2: Foundational (Blocking Prerequisites)
**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

- [ ] T007 [P] Implement `apps/zenith/src/hooks/use-hydrated.ts` to prevent SSR hydration mismatches
- [ ] T008 [P] Implement `apps/zenith/src/config/env.ts` for fail-fast environment validation
- [ ] T009 [P] Implement `apps/zenith/src/routes/error/startup.tsx` for visual validation failure feedback
- [ ] T010 [P] Create `apps/zenith/src/routes/__root.tsx` with metadata hoisting and global styles
- [ ] T011 [P] Define shared Domain Interfaces in `packages/appwrite-core/src/domain/repositories/`
- [ ] T012 [P] Implement Standardized Exceptions in `packages/appwrite-core/src/domain/exceptions/`
- [ ] T013 Implement AppWrite Repositories in `packages/appwrite-core/src/infrastructure/repositories/` using mapping logic

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Type-Safe Full-Stack Foundation (Priority: P1) 🎯 MVP
**Goal**: Establish the base for a fully initialized TanStack Start project with secure serverCap.

**Independent Test**: Running `pnpm dev` in `apps/zenith` shows the dashboard with working SSR and no hydration errors.

- [ ] T014 [US1] Implement `apps/zenith/src/infrastructure/appwrite/server.ts` base server functions
- [ ] T015 [US1] Create a sample safe route in `apps/zenith/src/routes/index.tsx` to verify end-to-end SSR
- [ ] T016 [US1] Verify `pnpm dev` starts and dashboard load without errors

---

## Phase 4: Polish & Cross-Cutting Concerns
**Purpose**: Final verification and security hardening

- [ ] T017 [P] **Security Audit (SC-004)**: Manually inspect client-side JS bundle for secret leaks
- [ ] T018 Final Biome lint and Typecheck across Zenith and AppWrite Core
- [ ] T019 Update project documentation with new architecture patterns

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 completion.
- **User Stories (Phase 3)**: Depends on Phase 2 completion.
- **Polish (Phase 4)**: Depends on story completion.

### Parallel Opportunities
- All Setup tasks marked [P] can run in parallel.
- All Foundational infrastructure tasks (T007-T012) can run in parallel.
- T017 (Security Audit) can run in parallel with final linting/typechecking.

---

## Implementation Strategy
### MVP First
1. Complete Phases 1 & 2 to establish the "spot on" foundation.
2. Complete US1 to verify full-stack type safety.
3. Validate and document.
