# Tasks: Zenith Hub (Phase 1 - Project Structure)

This task list focuses strictly on the **Project Structure** and **Core Infrastructure** as mandated by the user.

## Phase 1: Monorepo & Directory Alignment [P1]
- [X] T001 Rename `src/` to `app/` in `apps/zenith` to align with TanStack Start v1 directory conventions.
- [X] T002 Update `app.config.ts` in `apps/zenith` and update `vite.config.ts` to use `@tanstack/react-start/plugin/vite`.
- [X] T003 Update `tsr.config.json` to point `routesDirectory` to `./app/routes`.
- [X] T004 Update `components.json` to reflect the new `app/` directory for styles and components.

## Phase 2: Core Infrastructure (Back-to-Front) [P1]
- [X] T005 Implement `MockDataEngine` in `app/services/mockDataEngine.ts` for static analytics metrics.
- [X] T006 [P] Implement `SystemConfigRepository` in `packages/appwrite-core` (Constitutional Alignment §XV).
- [X] T007 [P] Implement `AppwriteExceptionMapper` (Constitutional Alignment §III).

## Phase 3: Administrative Shell Structure [P1]
- [X] T008 Implement `LayoutShell.tsx` structure (Container/Slots) in `app/components/layout/`.
- [X] T009 [P] Implement `Sidebar.tsx` navigation structure for all 7 entities.
- [X] T010 [P] Implement `Topbar.tsx` structure (Sticky).
- [X] T011 Implement `ClientOnly.tsx` wrapper for hydration safety. [Constitution §XVI]

## Phase 4: Route Initialization [P1]
- [X] T012 Update `__root.tsx` to integrate the `LayoutShell`.
- [X] T013 Initialize `index.tsx` (Dashboard) with static KPI cards using the `MockDataEngine`.
- [X] T014 [P] Initialize `settings.tsx` with the System tab structure.

## Phase 5: Verification [P1]
- [X] T015 Run `pnpm typecheck` in `apps/zenith`.
- [X] T016 Verify directory structure compliance with `speckit-analyze`.
- [ ] T017 [P] Execute initial BDD smoke test for Sidebar toggle functionality.
- [ ] T018 Inject `@vitejs/plugin-react` and verify React 19 JSX runtime compatibility.
- [ ] T019 Perform final BDD visual audit of the LayoutShell symmetry.
