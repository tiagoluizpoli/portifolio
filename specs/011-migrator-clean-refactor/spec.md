# Feature Specification: Refactor appwrite-migrator to Clean Architecture

> [!IMPORTANT]
> **WORK IN PROGRESS**: The architectural refactor and dependency hardening are physically complete, but the project is currently in a handoff state as work moves to another workstation. Final verification and SOLID compliance audit are pending.

**Feature Branch**: `011-migrator-clean-refactor`  
**Created**: 2026-04-18  
**Status**: Work in Progress  
**Input**: User description: "Refactor appwrite-migrator to Clean Architecture with SOLID classes and standardized imports"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Cognitive Load Reduction (Priority: P1)

As a developer joining the project, I want to open the `appwrite-migrator` codebase and immediately understand how commands are parsed and where the logic for each mode resides, without having to scroll through a 600-line file.

**Why this priority**: High cognitive load in the current monolithic structure makes the code error-prone and difficult to maintain.

**Independent Test**: Can be verified by measuring the reduction in file size of `index.ts` and the count of single-responsibility classes.

**Acceptance Scenarios**:

1. **Given** the current monolithic `src/index.ts`, **When** the refactor is complete, **Then** all core logic (Seed, Migrate, etc.) must reside in dedicated service classes.
2. **Given** the refactored project, **When** searching for a specific command's execution logic, **Then** it should be found in a class with a name matching the command (e.g., `SeedService`).

---

### User Story 2 - Standardized Monorepo Imports (Priority: P2)

As a developer, I want to use standardized alias imports (`@/*`) and avoid manual file extensions (like `.js`) in my TypeScript files, ensuring consistency with other packages in the monorepo.

**Why this priority**: Inconsistent import patterns lead to confusion and potential runtime issues in ESM/CJS environments.

**Independent Test**: All internal imports in `appwrite-migrator` use aliases and no file extensions.

**Acceptance Scenarios**:

1. **Given** an import from a local service, **When** I write the import, **Then** I should use `@/services/service-name` without a `.js` or `.ts` extension.

---

### User Story 3 - Architectural Hardening (Priority: P1)

As an architect, I want to ensure that any change to one feature (e.g., Template generation) does not accidentally break another (e.g., Database Migration) due to shared global state or overly coupled functions.

**Why this priority**: Essential for maintaining a "Zero-Regression" policy as the project grows.

**Independent Test**: Run the full test suite (`pnpm test`) and ensure 100% pass rate after refactoring.

**Acceptance Scenarios**:

1. **Given** a refactored class for a specific mode, **When** I run the tests, **Then** all previous functional requirements must still be met.

---

### User Story 4 - Infrastructure Leakage Isolation (Priority: P1)

As an architect, I want to ensure the Service layer strictly uses domain-native typescript types to query data so that Appwrite SDK intricacies (like `Query.limit`) do not leak out of the Repository layer.

**Why this priority**: Essential to enforce the true separation of concerns required by Clean Architecture.

**Independent Test**: Visually or automatically searching for `Query.*` inside `src/services/` should yield zero results.

**Acceptance Scenarios**:

1. **Given** a service needing paginated data, **When** it calls the repository, **Then** it passes a typed primitives object (`RepositoryQueryOptions`).
2. **Given** the `BaseRepository`, **When** parsing domain options, **Then** it validates the payload using Zod and maps it to SDK primitives.

---

### Edge Cases

- **CLI Flag Conflicts**: The refactored parser must still correctly handle and error on conflicting flags (e.g., providing both `--seed` and `--migrate`).
- **Environment Loading**: Variables must be loaded correctly regardless of whether they come from a `.env` file path provided via CLI or the default environment.
- **Async Polling**: During migration, asynchronous attribute creation must still be correctly managed (SRP ensures this logic is isolated).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement a Clean Architecture layers:
  - **Infrastructure/CLI**: CLI entry point, argument parsing, error reporting.
  - **Application Services**: Mode-specific command orchestrators (Check, Migrate, Seed, Template).
  - **Domain**: Calculation logic (Delta, Plans) and validation schemas.
- **FR-002**: Each Migrator mode MUST be a dedicated Class with a standard interface or abstract base.
- **FR-003**: CLI Argument parsing MUST be encapsulated in a dedicated utility or class, removing all arg processing from the main execution loop.
- **FR-004**: System MUST use absolute alias imports (`@/*`) pointing to `src/`.
- **FR-005**: Internal imports MUST NOT include `.js` or `.ts` extensions. Development MUST use `tsx` to support extensionless resolution, while production builds MUST ensure compatibility without single-file bundling.
- **FR-006**: Unit tests MUST be co-located in `src/` (e.g., `src/services/seed.service.spec.ts`). Integration and E2E tests MUST reside in a dedicated `tests/` directory at the app root (e.g., `apps/appwrite-migrator/tests/`).
- **FR-007**: The entry point (`src/index.ts`) MUST only be responsible for initializing the runtime and dispatching to the CLI handler.

### Key Entities *(include if feature involves data)*

- **MigratorCli**: The entry point class that orchestrates argument parsing and service dispatch.
- **AbstractModeService**: Base interface for all migrator modes ensuring a consistent `execute()` contract.
- **SeederService**: Refactored class for seeding logic.
- **MigrationService**: Refactored class for schema migration logic.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `src/index.ts` length reduced to < 80 lines.
- **SC-002**: 100% pass rate on all existing tests (Unit & E2E) in both local development and CI environments.
- **SC-003**: Zero imports containing `.js` extension within the `appwrite-migrator` workspace.
- **SC-004**: All logic from the current `index.ts` is redistributed into at least 4 distinct service modules.
