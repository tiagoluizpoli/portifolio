# Tasks: Zenith Setup (Checklist Aligned)

**Project**: Zenith | **Branch**: `003-zenith-setup` | **Input**: [spec.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/003-zenith-setup/spec.md)

## Phase 1: Setup & Environment Calibration
**Goal**: Establish a baseline environment identical to `clean-tanstack-proj`.

- [x] T001 Sync `apps/zenith/package.json` with React 19/TanStack RC.
- [x] T002 Configure `apps/zenith/tsconfig.json` with `#/*` absolute aliases.
- [x] T003 Implement `apps/zenith/vite.config.ts` matching base plugin stack.
- [x] T004 [P] Configure `apps/zenith/components.json` with absolute aliases.
- [x] T005 [P] Port `src/styles.css` with OKLCH tokens and **Visual Parity** mapping.
- [x] T006 Ensure Biome-only linting (remove `.eslintrc.json`, `.prettierrc` in `apps/zenith`).

## Phase 2: Core Infrastructure (Foundational)
**Goal**: Establish the cross-cutting modules required for all user stories.

- [x] T007 Implement `apps/zenith/src/router.tsx` using the `getRouter()` factory pattern.
- [x] T008 [P] Implement `apps/zenith/src/config/env.ts` for fail-fast validation (SKIP_ENV_VALIDATION support).
- [x] T009 [P] Initialize **Bulletproof Features** directory at `apps/zenith/src/features/`.
- [x] T010 Implement `apps/zenith/src/components/client-only.tsx` and `use-hydrated.ts`.
- [x] T011 Define Domain Models using **Zod schemas** in `@repo/appwrite-core` (SSoT).

## Phase 3: User Story 1 - Type-Safe Full-Stack (P1)
**Goal**: Verify the TanStack Start dashboard foundation.
**Independent Test**: `pnpm dev` loads the root orchestrator route (< 100 LoC) importing from `features/dashboard`.

- [x] T012 [US1] Implement `apps/zenith/src/routes/__root.tsx` with shell logic and `?url` style import.
- [x] T013 [US1] Port `THEME_INIT_SCRIPT` logic to `ThemeProvider` with **< 50ms** initialization target.
- [x] T014 [P] [US1] Add **FIXED LOGIC** comment block to `ThemeProvider` after zero-flash validation.
- [x] T015 [US1] Implement `apps/zenith/src/routes/index.tsx` as orchestrator (< 100 LoC limit).


## Phase 5: Resilience & Persistence (P1)
**Goal**: Ensure the app survives connectivity loss and multi-step failures.
**Independent Test**: Kill network during form fill → Verify backup in localStorage after redirection.

- [x] T019 [US4] Implement `TransactionManager` in `@repo/appwrite-core` with sync/async rollback support.
- [x] T020 [US4] Implement **Blocking Error Overlay** with pointer-lock/touch-prevention for rollbacks.
- [x] T021 [US4] Implement **Automatic Form Persistence** hook (`zenith:form-backup:*` namespace, 24h exp).
- [x] T022 [US4] Implement "Connection Lost" redirect logic (**3 consecutive failures / 10s timeout**).

## Phase 6: Final Polish & Audit
**Goal**: Security hardening and Lighthouse verification.

- [x] T024 [P] **Security Audit**: `grep` build output for leaked `APPWRITE_API_KEY`.
- [x] T025 Final Biome check and typecheck across all workspaces.

## Implementation Strategy
- **MVP (Phase 1-3)**: Establish the foundation, theme-safe provider, and first feature route.
- **Resilience (Phase 5)**: Critical path for admin hub stability.
- **Design (Phase 4)**: High-fidelity "wow" factor via Stitch.
- **Incremental PRs**: Merge by Phase to maintain quality gating.
