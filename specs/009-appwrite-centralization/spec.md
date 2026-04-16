# Feature Specification: Appwrite Central Logic Package (@repo/appwrite)

**Feature Branch**: `009-appwrite-centralization`  
**Created**: 2026-04-16  
**Status**: In Progress  
**Input**: User description: "Centralize all Appwrite logic into a new dedicated package. Focus on a mastermind architecture including Drizzle-like schema definitions, Zod-based versioned data shapes, robust repository patterns, and specialized services like MetricSync and Auth. Must maintain existing solid Appwrite standards (v3 breaking changes) while organizing everything for maximum maintainability. Zero interaction with Appwrite SDK outside this package."

## Scope Addendum (2026-04-16)

To reduce duplicated environment validation logic across apps, this feature now includes a shared configuration strategy:

- A dedicated shared package for environment variables (`@repo/config`)
- One typed helper that accepts an object of optional `true` flags for valid variable groups and returns a keyed object with typed, validated data
- Explicit Appwrite initialization remains mandatory (`initializeAppwrite(config)`), with config sourced from the shared env package

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The Domain Schema Master (Priority: P1)

As a backend architect, I want to define my Appwrite collection structures in a single "Schema DSL" file within the package so that all Zod validation and TypeScript types are automatically synchronized with the database's expected state.

**Why this priority**: Eliminates the "mingled" logic where schemas are defined ad-hoc. Ensures that any change to a collection definition propagates to every type in the system.

**Independent Test**: Can be validated by updating a schema definition and verifying that the `Insert`, `Full`, and `List` types reflect the change immediately without manual type editing.

**Acceptance Scenarios**:

1. **Given** a collection "Projects", **When** I define its attributes in the Schema DSL, **Then** the package must export a `ProjectInsertSchema` (no internal fields), `ProjectFullSchema` (with `$id`, `$createdAt`), and `ProjectListSchema` (for query results).
2. **Given** an invalid data payload, **When** passed to the Schema's `parse()` method, **Then** it must return a precise Zod error mapped to the domain, not the Appwrite SDK.

---

### User Story 2 - The Unified Repository Consumer (Priority: P1)

As an application developer (Zenith/Web), I want to import a typed Repository for each collection so that I can perform CRUD operations without ever touching the `node-appwrite` SDK directly.

**Why this priority**: Decouples the frontend/CLI from the Appwrite implementation details. Allows for easier testing and prevents leakage of "server-only" credentials into client code via type leakage.

**Independent Test**: Can be tested by mocking the Appwrite Client and verifying that the `AboutRepository.get()` call returns a domain-aligned model correctly.

**Acceptance Scenarios**:

1. **Given** a Repository instance, **When** I call `find()`, **Then** the returned types must be exactly the `Full` version defined in the Schema DSL.
2. **Given** a Repository method call, **When** it fails, **Then** it must throw a domain-specific error (e.g., `AppwriteNotFoundError`, `AppwritePermissionError`) rather than a raw Axios/internal error.

---

### User Story 3 - The Ghost-Row Propagation Engine (Priority: P2)

As a content manager, I want my metrics to be automatically synchronized across all supported locales (EN/PT) using the "Ghost Row" engine so that I don't have to manually create placeholder metrics for every language.

**Why this priority**: Critical for data parity in multi-locale applications. Ensures that if a metric is added to EN, a PT "Ghost Row" (draft) is created to preserve the layout.

**Independent Test**: Can be tested by inserting a metric for locale 'en' and verifying that the `MetricSyncService` creates a corresponding document for 'pt' with `isPlaceholder: true`.

**Acceptance Scenarios**:

1. **Given** a new source metric in 'en', **When** `MetricSyncService.sync()` is called, **Then** it must perform a "Serial with Rollback" operation: if creating any localized ghost row fails, all previously created rows in that transaction MUST be rolled back.
2. **Given** an existing ghost row, **When** the source metric's non-localized metadata (e.g., `iconCode`) changes, **Then** the service must propagate those changes to all localized versions.

---

### User Story 4 - The Type-Safe Storage Orchestrator (Priority: P2)

As a developer, I want to interact with Appwrite Storage via a generic service that uses Zod to validate file properties (name, fileId, bucketId) so that I can manage Pictures and PDFs safely without exposing internal bucket logic.

**Why this priority**: Protects the application from "Bucket Id" leakage. Centralizes the logic for preview URLs, view URLs, and metadata handling.

**Independent Test**: Can be tested by uploading a file via the `StorageService` and verifying it uses the correct Environment Variable for the bucket based on the file type (Picture vs PDF).

**Acceptance Scenarios**:

1. **Given** a base64 file string, **When** `StorageService.upload()` is called, **Then** it must validate the `UploadAssetSchema` and resolve the correct bucket ID from the environment.
2. **Given** a file document, **When** requesting a preview, **Then** the service should return a signed URL or public preview URL based on the bucket's permissions.

---

### User Story 5 - The Auth & Session Guardian (Priority: P3)

As a security-conscious developer, I want a dedicated `AuthService` within the package to handle session validation and permission checking so that I can enforce consistent auth guards across all apps.

**Why this priority**: Centralizes the most critical part of the application infrastructure.

**Independent Test**: Can be tested by passing a session token to the service and verifying it identifies the user's roles and permissions correctly.

---

### User Story 6 - The Centralized Environment Broker (Priority: P1)

As an application developer, I want a single typed helper to resolve required environment variable groups so that every app can consume validated configuration without duplicating env parsing/validation logic.

**Why this priority**: This creates one fail-fast source of truth for runtime configuration and removes repetitive env checks across apps/packages.

**Independent Test**: Can be tested by requesting `{ appwrite: true }` and verifying a typed `appwrite` config object is returned; boot must fail with descriptive errors when required vars are missing.

**Acceptance Scenarios**:

1. **Given** `getEnv({ appwrite: true })`, **When** all vars are present, **Then** the helper must return `{ appwrite: { ...typed fields } }`.
2. **Given** one required variable missing, **When** `getEnv(...)` is called, **Then** the app must fail fast with a descriptive validation error naming missing vars.
3. **Given** multiple flagged keys, **When** helper resolves them, **Then** return shape must be keyed by the requested `true` groups only.
4. **Given** a group key is omitted or passed as `false`, **When** helper resolves config, **Then** that group must be treated as not requested.

### Edge Case Matrix

- **Appwrite v3 Parity**: Ensuring all repositories use the latest breaking-change signatures (e.g., correct Query parameter structures).
- **Environment Paranoia**: The package MUST throw a "Catastrophic Configuration Error" if required Bucket/Database IDs are missing from the environment at initialization.
- **Grouped Validation**: Requesting env groups must never return partial data. Any missing variable in any requested group fails the whole resolution.
- **Atomic Rollbacks**: Handling partial failures in multi-collection operations (e.g., creating a user and their initial profile row).
- **Cursor-based Infinity**: Handling "List" operations where the cursor is no longer valid or points to a deleted document.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-PKG-001**: System MUST be a standalone package (`@repo/appwrite`) that wraps the `node-appwrite` SDK.
- **FR-PKG-002**: Package MUST NOT expose `node-appwrite` types or classes in its public exports.
- **FR-PKG-003**: System MUST implement a "Schema Registry" using Zod that maps 1:1 with Appwrite Collection attributes.
- **FR-PKG-004**: System MUST export three typed versions for every schema: `Insert` (input), `Full` (output), and `List` (paged output).
- **FR-PKG-005**: All Repositories MUST extend a `BaseRepository` providing standard CRUD with domain error mapping.
- **FR-PKG-006**: `MetricSyncService` MUST implement the "Ghost Row" logic with "Serial with Rollback" safety.
- **FR-PKG-007**: `StorageService` MUST utilize environment variables for Bucket IDs and handle metadata orchestration.
- **FR-PKG-008**: `AuthService` MUST encapsulate session lifecycle and permission resolution logic.
- **FR-PKG-009**: System MUST include its own internal logger to track Appwrite interaction latencies and errors before they reach the consumer.
- **FR-PKG-010**: System MUST provide a `Verification` utility that can compare data shapes from the legacy package against the new package for parity auditing.
- **FR-PKG-011**: System MUST provide a shared env package (`@repo/config`) that centralizes zod-based runtime validation for variable groups.
- **FR-PKG-012**: `@repo/config` MUST expose a single typed helper (`getEnv`) accepting an object of optional `true` group keys and returning a keyed typed object for requested (`true`) groups.
- **FR-PKG-013**: Consumer apps (e.g., migrator) MUST initialize `@repo/appwrite` with validated typed values returned by `@repo/config`, not ad-hoc env reads.
- **FR-PKG-014**: `@repo/appwrite` MUST remain explicitly initialized and must not auto-initialize on first method call.

### Key Entities

- **Domain Model**: The "Full" Zod representation of a document, sanitized of Appwrite-specific internal state where applicable.
- **Ghost Row**: A placeholder document created for data parity across locales.
- **Compensating Action**: An operation (e.g., delete) queued to run if a subsequent part of a multi-step operation fails.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-PKG-001**: 0 imports of `node-appwrite` in the Zenith or Migrator source code once migrated.
- **SC-PKG-002**: 100% type coverage for all database attributes (Verified by `pnpm lint`).
- **SC-PKG-003**: "Parity Integrity": No metric exists in EN without a corresponding Ghost Row (Draft) in PT within 1 second of creation (verified by integration tests).
- **SC-PKG-004**: "Initialization Safety": The app crashes at boot if a single required Appwrite env variable is missing, providing a descriptive error.
- **SC-PKG-005**: "Rollback Reliability": In the event of a partial `sync()` failure, 100% of newly created database rows must be purged.
- **SC-PKG-006**: "Parity Pass": 100% of collection documents fetched via the new package must be deep-equal to those fetched via the legacy core (excluding new metadata fields).
- **SC-PKG-007**: "Config Centralization": 0 duplicated Appwrite env validation blocks across consuming apps after migration to `@repo/config`.
- **SC-PKG-008**: "Typed Group Access": `getEnv({ ... })` returns fully inferred key-safe types for all requested `true` groups.
