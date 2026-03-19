# Tasks: Monorepo Structure

**Input**: Design documents from `specs/001-monorepo-structure/` and associated Checklists.
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Initialize root `package.json` with `engines.pnpm: ">=9.0.0"` and workspaces (`apps/*`, `packages/*`)
- [ ] T002 [P] Create root `biome.json` configured for `Biome ~2.3.12` (Unified strategy)
- [ ] T003 [P] Create root `commitlint.config.js` for Conventional Commits
- [ ] T003a [P] Initialize `packages/appwrite-core` with `zod ^3.x` schemas and exported types (FR-010)

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 Create root `scripts/setup-hooks.sh` for python `.venv` and `pre-commit` installation
- [ ] T005 [P] Enhance `scripts/setup-hooks.sh` with robust error handling for `python3-venv` and non-TTY CI fallbacks
- [ ] T006 [P] Create `.pre-commit-config.yaml` and `.lintstagedrc` mapping staged files to `biome check`
- [ ] T007 Add `"prepare": "bash scripts/setup-hooks.sh"` and global `"lint": "biome check ."` to `package.json`
- [ ] T008 [P] Add a rollback script `"clean:hooks": "rm -rf .venv .git/hooks/*"` for hook recovery

## Phase 3: User Story 1 - Standardized Dev Env (Priority: P1)

- [ ] T009 [US1] Execute hook installation via `pnpm install` and verify `.venv` isolation
- [ ] T010 [P] [US1] Run `pnpm lint` and ensure Biome auto-fixes safe issues automatically (no --unsafe)
- [ ] T011 [US1] Validate `commitlint` gating by attempting a `git commit` with an invalid message

## Phase 4: User Story 2 - Mandatory Architecture Pattern (Priority: P2)

- [ ] T012 [P] [US2] Create skeletal `apps/web/src` features/components/domain tree
- [ ] T013 [P] [US2] Create skeletal `apps/admin/src` tree
- [ ] T014 [P] [US2] Create skeletal `apps/migrator/src` Clean Architecture tree: `api/`, `application/`, `domain/`, `infrastructure/`, `main/`
- [ ] T015 [P] [US2] Create skeletal @repo/appwrite-core layers: `domain/`, `infrastructure/`
- [ ] T016 [P] [US2] Add `.gitkeep` to all empty mandatory directories

## Phase 5: CI/CD & SOLID Documentation (Polish)

- [ ] T017 [P] Create `.github/workflows/ci.yml` to enforce `pnpm lint` and `commitlint` on PRs (FR-009)
- [ ] T018 [P] Update `README.md` to document SOLID/Clean Code standards and cross-layer logic restrictions (FR-012)
- [ ] T019 [P] Update `README.md` to document cyclical dependency avoidance and `@repo/appwrite-core` purpose
- [ ] T020 Run full repository structural validation and finalize feature delivery
