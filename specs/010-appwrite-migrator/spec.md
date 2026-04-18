# Feature Specification: Appwrite Migrator (Relational)

**Status**: [DRAFT]
**Feature Owner**: Zenith Platform Team
**Priority**: [HIGH]
**Epic**: [INFRASTRUCTURE]

## Overview *(mandatory)*

The **Appwrite Migrator** is a specialized Node.js service designed to automate infrastructure-as-code (IaC) for Appwrite projects using the modern **TablesDB** relational paradigm. It provides a deterministic, idempotent way to synchronize database schemas (`Tables`, `Columns`, `Indexes`) and seed row-level data from remote sources.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Schema Evolution (Priority: P1)

As a Developer, I want to synchronize my local database blueprints with the remote Appwrite project using an incremental, non-destructive process, so that I can evolve the schema without losing data.

**Why this priority**: Core enabler for agile development and safe deployments.

**Independent Test**: Can be tested by comparing existing Appwrite tables against code blueprints and verifying that only missing tables or columns are added.

**Acceptance Scenarios**:

1. **Given** a new blueprint for a table, **When** the `migrate` action is executed, **Then** a new Table with its Columns and Indexes must be created in Appwrite.
2. **Given** an existing table missing one column defined in the blueprint, **When** the `migrate` action is executed, **Then** only the missing Column should be added without affecting existing rows.
3. **Given** a column that exists in Appwrite but not in the blueprint, **When** the `migrate` action is executed, **Then** the column must NOT be deleted unless explicitly authorized.

---

### User Story 2 - Smart Multi-Language Seeding (Priority: P2)

As a Content Manager, I want to seed data into the database with automatic deduplication based on logical keys (like name and locale), so that I can maintain multiple translations without creating duplicates or requiring manual IDs.

**Why this priority**: Essential for populating multi-language content and maintaining data integrity across environments.

**Independent Test**: Can be tested by running a seed job twice with the same JSON and verifying that duplicate rows are not created, and that newly added translations are inserted correctly.

**Acceptance Scenarios**:

1. **Given** a valid row in the source JSON without an ID, **When** the `seed` action is executed, **Then** a new Row must be created with an auto-generated Appwrite ID.
2. **Given** a row that already exists in Appwrite (matching predefined `uniqueLogicKeys`), **When** the `seed` action is executed, **Then** the row should be updated (Upsert) if changes are detected, otherwise ignored.
3. **Given** multiple rows for the same entity but with different `locale` values, **When** the `seed` action is executed, **Then** all rows must be preserved as distinct records.
4. **Given** a record in the source that violates a validation schema, **When** the `seed` action is executed, **Then** the synchronization must fail with a descriptive error.

---

### User Story 3 - Deployment Verification (Priority: P3)

As a System Administrator, I want to check if the current environment requires schema updates without actually applying them, so that I can audit the deployment state safely.

**Why this priority**: Provides a safety check for manual interventions or pre-deployment audits.

**Independent Test**: Can be tested by running the `check` action and verifying it returns a successful status if everything is synced or a warning status if migrations are pending.

**Acceptance Scenarios**:

1. **Given** a synchronized environment, **When** the `check` action is executed, **Then** the process should exit with a "success" (0) status.
2. **Given** an environment with missing tables or columns, **When** the `check` action is executed, **Then** the process should exit with a "pending" (1) status and list the delta.

---

### Edge Cases

- **Connectivity Failures**: How does the system handle temporary network loss to the destination endpoint during migration? (Must retry or fail with a clean exit status).
- **Rate Limiting**: How does the seeder handle API rate limits when processing large datasets? (Must implement batching or throttling logic).
- **Interrupted Migration**: What happens if the execution terminates mid-migration? (The tool must handle "already exists" scenarios gracefully on subsequent runs).
- **Invalid Environment**: How does the tool handle missing or malformed configuration (API keys, project identifiers)? (Must validate environment on startup and terminate immediately).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST implement a `check` command to audit the current state vs. the desired schema.
- **FR-002**: The system MUST implement a `migrate` command that incrementally and idempotently synchronizes Tables, Columns, and Indexes.
- **FR-003**: The system MUST implement a `seed` command as a separate, opt-in action that processes row-level data.
- **FR-004**: All database and storage operations MUST be performed exclusively through the high-level services and repositories in `@repo/appwrite`, ensuring total concealment of the underlying SDK.
- **FR-005**: Every seed row MUST be validated against Zod schemas from `@repo/appwrite` before upload.
- **FR-006**: The system MUST support **Unique Logic Keys** for row deduplication and multi-language upserts during seeding.
- **FR-007**: The system MUST allow optional row IDs, falling back to Appwrite's auto-generated standards if omitted.
- **FR-008**: The system MUST implement a `template` command to generate a layered JSON template and a Markdown specification file in the configuration bucket.
- **FR-009**: The storage service MUST provide a generic `download` capability to handle any binary file type (JSON, images, PDFs).
- **FR-010**: The system MUST be 100% covered by tests, including success paths, failure cascades, and edge cases.
- **FR-011**: The system MUST implement a "Living State" for destructive changes via a single `destructive-state.json` file in the remote bucket. It MUST auto-detect discrepancies (missing in blueprints but present in remote), list them as `false` by default, and only execute deletion if the user manually flips the value to `true`. Deployed items must be pruned from the file after successful destruction.

### Key Entities *(include if feature involves data)*

- **Table Blueprint**: A declarative definition of a relational table (ID, Columns, Indexes, Unique Logic Keys).
- **Seed Template**: A generated JSON structure containing example rows for every defined table.
- **Destructive Config**: A whitelist of tables/columns that the system is permitted to delete.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **100% Test Coverage** (Success, Failure, Edge Cases) across the full testing pyramid.
- **SC-002**: 100% of schema definitions in the core package must be reflected in the destination project after migration.
- **SC-003**: Zero duplicate rows created when seeding with the same source JSON (validated by `uniqueLogicKeys`).
- **SC-004**: Zero records that fail validation schemas may be uploaded.
- **SC-005**: 100% data parity between source JSON and destination database.
