# Feature Specification: Appwrite Infrastructure and Migration

**Feature Branch**: `002-appwrite-infra-migration`  
**Created**: 2026-03-20  
**Status**: Completed  
**Input**: User description: "High-fidelity migration of portfolio data from Directus to Appwrite."

## User Scenarios & Testing

### User Story 1 - Automated Schema Provisioning (Priority: P1)

As a developer, I want the system to automatically provision the Appwrite database and tables so that I don't have to manually configure the schema.

**Why this priority**: Required for reproducible environments and CI/CD pipelines.

**Independent Test**: Can be verified by running the schema manager against a fresh database and checking for table existence.

**Acceptance Scenarios**:

1. **Given** a new Appwrite project, **When** the schema manager runs, **Then** all 7 tables (Home, Experience, Education, Skills, Solutions, Socials, Contact Info) are created with correct attributes.
2. **Given** existing tables, **When** the schema manager runs, **Then** missing columns are added without destroying existing data.

---

### User Story 2 - Transactional High-Fidelity Migration (Priority: P1)

As a user, I want my portfolio data to be migrated with 100% fidelity and atomic rollback so that I never have partial or corrupt data.

**Why this priority**: Ensures data integrity and prevents broken states in production.

**Independent Test**: Verified by mocking a failure mid-batch and confirming that no partial records are committed.

**Acceptance Scenarios**:

1. **Given** a Directus dataset, **When** the migration runs, **Then** all 38+ skills and bilingual content (EN/PT) are pushed to Appwrite.
2. **Given** a failure during ingestion, **When** the transaction rolls back, **Then** the database remains in its initial clean state.

---

### User Story 3 - Asset Lifecycle Management (Priority: P2)

As a developer, I want orphaned assets to be moved to a trash bucket so that the main storage stays clean without risk of data loss.

**Why this priority**: Saves storage costs and maintains high performance without accidental data deletion.

**Independent Test**: Can be tested by uploading a dummy file, running cleanup, and verifying its move to the trash bucket.

**Acceptance Scenarios**:

1. **Given** unreferenced assets in the main bucket, **When** the cleanup runs, **Then** they are moved to the `trash` bucket.
2. **Given** referenced assets, **When** the cleanup runs, **Then** they remain untouched in the `assets` bucket.

## Requirements

### Functional Requirements

- **FR-001**: System MUST create 7 tables with explicit column definitions: Home, Experience, Education, Skills, Solutions, Socials, Contact Info.
- **FR-002**: System MUST support bilingual content (EN/PT) via flattening of nested translation objects.
- **FR-003**: System MUST use the Appwrite `createTransaction` and `updateTransaction` API for atomic data seeding.
- **FR-004**: System MUST handle asset uploads for `profile.jpg` and `cv.pdf` with dynamic storage ID mapping.
- **FR-005**: System MUST implement deterministic slug-based IDs (e.g., `skill-typescript`) to ensure idempotency.
- **FR-006**: System MUST support CLI-driven conflict strategies: `--skip` (default) and `--overwrite`.

### Key Entities

- **Home**: Core profile data with bilingual titles and descriptions.
- **Experience/Education**: Historical records with duration and institution mapping.
- **Skills**: Categorized technical stack entries with iconic representations.
- **Solutions**: Key projects or solutions offered, fully localized.
- **Socials/Contact**: External links and communication channels.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of Directus master data (38+ skills, 8+ solutions) migrated without manual correction.
- **SC-002**: Migration tool is 100% idempotent (subsequent runs with `--skip` produce 0 new writes).
- **SC-003**: ZERO data loss during multi-batch transactional seeding.
- **SC-004**: Zero linting or type-checking errors in the migrator service.
