# Specification: appwrite-migrator Clean Architecture Refactor

**Version**: 1.2.0 | **Status**: Work in Progress | **Related Spec**: None

---

## Context *(mandatory)*

The `appwrite-migrator` is currently a monolithic Node.js script where the entry point (`index.ts`) handles CLI flag parsing, environment loading, service orchestration, and data transformation logic. This leads to high cognitive load, low testability, and tight coupling between the CLI interface and the Appwrite infrastructure.

## User Stories *(mandatory)*

- **[US1] Split Main Entrypoint**: As a developer, I want all CLI orchestration separated from the migrator's core logic, so I can test and maintain them independently.
- **[US2] Clean Monorepo Imports**: As a developer, I want to use standardized path aliases (`@/`) and extensionless imports across the project.
- **[US3] Decoupled Service Logic**: As a developer, I want each migrator mode (Seed, Migrate, etc.) to live in its own service class with a defined interface.
- **[US4] Infrastructure Isolation**: As a developer, I want to purge Appwrite-specific query builders (like `Query`) from the service layer so that high-level logic remains decoupled from the SDK.

### Hardening Phase Stories (NEW)
- **[US5] Structural Decomposition**: As a developer, I want to ensure that no single file exceeds 300 lines by decomposing complex services (like Seeder) into atomic units (Validator, Planner, Executor).
- **[US6] Domain Integrity**: As a developer, I want to use **Branded Types** for domain identifiers (`TableId`, `BucketId`, `FileId`) to prevent string-primitive confusion.
- **[US7] Configuration Hardening**: As a developer, I want to use a **Zod Configuration Schema** for runtime validation of all CLI flags and environment variables.

---

### Logic Flows

1. **Given** a terminal command, **When** parsed by the CLI orchestrator, **Then** it dispatches to the appropriate mode-specific service.
2. **Given** an Application Service, **When** it needs to query the database, **Then** it uses the `BaseRepository` with `RepositoryQueryOptions`, never the Appwrite `Query` builder directly.
3. **Given** the `Seeder` mode, **When** executing, **Then** it delegates to `SeederValidator`, `SeederPlanner`, and `SeederExecutor` respectively.

---

### Edge Cases

- **CLI Flag Conflicts**: The refactored parser must correctly handle and error on conflicting flags (e.g., providing both `--seed` and `--migrate`).
- **Environment Loading**: Variables must be loaded correctly regardless of whether they come from a `.env` file path provided via CLI or the default environment.
- **SDK Polling**: During migration, asynchronous attribute creation must still be correctly managed (SRP ensures this logic is isolated).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement Clean Architecture layers (CLI -> Services -> Repositories).
- **FR-002**: Each Migrator mode MUST be a dedicated Class with a standard interface or abstract base.
- **FR-003**: CLI Argument parsing MUST be encapsulated in a dedicated utility or class.
- **FR-004**: System MUST use absolute alias imports (`@/*`) pointing to `src/`.
- **FR-005**: Internal imports MUST NOT include `.js` or `.ts` extensions.
- **FR-006**: Unit tests MUST be co-located in `src/`.
- **FR-007**: The entry point (`src/index.ts`) MUST only initialize the runtime and dispatch to the CLI handler.

### Hardening Requirements (NEW)
- **FR-008**: System MUST use **Branded Types** for `TableId`, `BucketId`, and `FileId` to ensure domain integrity across the monorepo.
- **FR-009**: System MUST use a **Zod Configuration Schema** for runtime validation of all CLI flags and environment variables.
- **FR-010**: Every service or class MUST strictly adhere to the **300-line budget** defined in Constitution Principle VIII.

### Key Entities

- **MigratorCli**: The entry point class that orchestrates argument parsing and service dispatch.
- **AbstractModeService**: Base interface for all migrator modes ensuring a consistent `execute()` contract.
- **SeederValidator/Planner/Executor**: Specialized services for the seeding lifecycle stages.
- **SchemaComparator**: Pure logic for calculating structural differences between schemas.
- **MigrationService**: Refactored class for schema migration logic.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `src/index.ts` length reduced to < 80 lines.
- **SC-002**: 100% pass rate on all existing and new tests.
- **SC-003**: Zero imports containing `.js` extension within the `appwrite-migrator` workspace.
- **SC-004**: Implementation has zero files exceeding the **300-line budget**.
- **SC-005**: Zero occurrences of `as unknown` or unsafe casts in production code.
