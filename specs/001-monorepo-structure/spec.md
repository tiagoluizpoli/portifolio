# Feature Specification: Monorepo Structure

**Feature Branch**: `001-monorepo-structure`  
**Created**: 2026-03-19  
**Status**: Draft  
**Input**: Define monorepo structure and mandatory folder patterns based on grocery-store.

## Clarifications

### Session 2026-03-19
- Q: Which approach do you prefer for standardizing infrastructure commands (scripts/ vs Taskfile.yml)? → A: Option A - Bash scripts in a root `scripts/` directory.
- Q: Which areas should be explicitly declared OUT OF SCOPE for this feature? → A: Option B - All business logic, DB schemas, and UI components are out of scope (skeletal only).
- Q: Should we explicitly pin the versions of our core tools (Biome, pnpm)? → A: Option A - Pin core tools (`Biome ~2.3.12`, `pnpm ^9.x`).
- Q: How should environment variables (`.env`) be managed across this monorepo structure? → A: Option A - Distributed `.env` files per app (ignored) + `.env.example`.
- Q: Should the monorepo spec explicitly mandate a GitHub Action (or equivalent) to enforce Biome and Commitlint? → A: Option A - Mandatory CI gate for linting and commits.
- Q: How should the core domain entities in `packages/shared` be defined? → A: Option C - Zod Schemas for runtime safety, form validation, and DB consistency.
- Q: Should our automated `pre-commit` hooks be allowed to apply "unsafe" Biome fixes? → A: Option B - Manual review only. AI must strictly evaluate implications and invoke a clarification run if unsure.

## Out of Scope
- Implementation of actual AppWrite Collections or data models.
- UI styling, themes, or custom components beyond Shadcn primitives.
- Integration tests involving real AppWrite backend services.
- Data migration logic from Directus (reserved for Phase 2).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Standardized Development Environment (Priority: P1)

As a developer, I want a consistent monorepo setup with unified linting and commit standards so that I can work across different apps/packages without context switching on tooling.

**Why this priority**: High. This is the foundation of the entire refactor.

**Independent Test**: Can be tested by running `pnpm lint`, `pnpm test`, and attempting a commit that violates conventional commit rules.

**Acceptance Scenarios**:

1. **Given** a new developer clone, **When** they run `pnpm install`, **Then** the environment is fully setup including pre-commit hooks.
2. **Given** a file with linting errors, **When** they run `pnpm lint`, **Then** Biome identifies and auto-fixes issues.
3. **Given** a non-standard commit message, **When** they try to commit, **Then** the commit is blocked by `commitlint`.

---

### User Story 2 - Mandatory Architecture Pattern (Priority: P2)

As an architect, I want to enforce a specific folder structure for all apps (frontend/migrator) and shared packages so that the codebase remains organized and follows Clean Architecture principles.

**Why this priority**: Medium. Ensures long-term maintainability.

**Independent Test**: Can be tested by verifying the directory existence and ensuring no logic leaks between mandated layers (e.g., UI components not having direct DB access).

**Acceptance Scenarios**:

1. **Given** a frontend app, **When** I look at `src/`, **Then** I see `features/`, `domain/`, `infrastructure/`, etc. as mandated.
2. **Given** a backend/migrator app, **When** I look at `src/`, **Then** I see `domain/`, `application/`, `infrastructure/`, etc.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use `pnpm ^9.x` workspaces for monorepo management.
- **FR-002**: System MUST use `Biome ~2.3.12` for unified linting and formatting (standardized in root).
- **FR-003**: System MUST implement `pre-commit` (Python-based or Node-based) with `lint-staged` and `commitlint`.
- **FR-004**: Frontend apps MUST follow the mandatory structure: `assets/`, `components/`, `config/`, `domain/`, `features/`, `hooks/`, `infrastructure/`, `lib/`, `providers/`, `routes/`.
- **FR-005**: Migrator/Backend apps MUST follow Clean Architecture: `api/`, `application/`, `domain/`, `infrastructure/`, `main/`.
- **FR-006**: The AppWrite core package (`packages/appwrite-core`) MUST prioritize `domain/` and `infrastructure/` layers.
- **FR-007**: Foundational setup scripts (like git hooks) MUST be localized in a root `scripts/` directory. Full infrastructure (up/down) scripts are deferred to Phase 2.
- **FR-008**: Secrets MUST be managed via distributed `.env` files per application. These files MUST be git-ignored, and each application MUST provide a `.env.example` for local setup.
- **FR-009**: The repository MUST include a root-level CI workflow (e.g., GitHub Action) to enforce Biome linting/formatting and Conventional Commits on all Pull Requests to the main branch.
- **FR-010**: Domain entities MUST be defined using `Zod` schemas in `@repo/appwrite-core`. These schemas MUST be used for both frontend form validation and backend/migrator data consistency.
- **FR-011**: AI agents MUST NOT auto-apply "unsafe" Biome fixes in automated runs. If an unsafe fix is necessary but its implications are ambiguous, the AI MUST pause and initiate a clarification session with the user.
- **FR-012**: Implementation MUST strictly adhere to **SOLID** principles and **Clean Code** standards (e.g., meaningful names, small functions, single responsibility).

### Key Entities

- **Workspaces**: `apps/web`, `apps/admin`, `apps/migrator`, `packages/appwrite-core`.
- **Root Configs**: `biome.json`, `pnpm-workspace.yaml`, `.lintstagedrc`, `.pre-commit-config.yaml`, `commitlint.config.js`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of apps/packages conform to the mandatory folder pattern.
- **SC-002**: Root `lint` command covers all workspaces and returns zero errors.
- **SC-003**: Pre-commit hooks execute in under 5 seconds for incremental changes (measured locally on a warm cache with Biome).
- **SC-004**: Conventional commit standard is enforced on 100% of new commits.
