# Test Plan: Appwrite Migrator (Hardened)

This document defines the authoritative testing strategy for the Appwrite Migrator (Phase 2). All implementations MUST pass these scenarios before completion.

> **Rule Zero**: A test that only tests the happy path is half a test.

## 0. The Testing Pyramid

1. **Layer 4: E2E / Container Run**: Full pipeline simulation (Fresh State → Migrated → Seeded).
2. **Layer 3: App Orchestration**: `SeederService` orchestration and error reporting.
3. **Layer 2: Package Services**: `MigrationService` (SDK interactions) and specialized repositories.
4. **Layer 1: Schema / Blueprints**: Zod validation for snapshots and seed data.

## 1. Scenario Coverage Mandate

### Class 1: Happy Path (Works as Designed)
- **T-001**: `migrate` creates full structural set (Tables, Columns, Indexes) in clean project.
- **T-002**: `seed` populates 100% of valid records from a source JSON.
- **T-003**: `check` reports "synced" status when local and remote match perfectly.

### Class 2: Edge Cases (Boundary Conditions)
- **T-004**: Handle empty Tables/Columns arrays in `blueprints.ts`.
- **T-005**: Seed source with zero records (Empty JSON array).
- **T-006**: Migration with maximum attribute length strings (Appwrite limits).
- **T-007**: Seeding records with null/optional fields that are valid in Zod.

### Class 3: Invalid Input (User Error)
- **T-008**: Seeder rejects JSON where records violate `@repo/appwrite` Zod schemas.
- **T-009**: Migrator fails early if `MigrationBlueprint` contains invalid names (e.g., starting with number).
- **T-010**: `SEED_FILE_NAME` points to a non-existent file in Storage.

### Class 5: System Failures (Infrastructure)
- **T-011**: **Network Timeout**: Migrator retries or exits with clear status code if Appwrite is unreachable.
- **T-012**: **Rate Limit (429)**: Seeder implements backoff when Appwrite throttle is triggered.
- **T-013**: **Incomplete Structure**: Handle cases where some attributes exist but others are missing (partial migration recovery).

### Class 8: Catastrophic Failures
- **T-014**: Appwrite returns 500 during table creation; system exits without corrupting local state.
- **T-015**: Missing required Environment Variables (Fail fast with code 1).

## 2. Layered Scenarios

### Layer 2 & 3: Migration & Seed Logic (Package & App)
| Requirement | Scenario            | Expected Outcome                                               |
| :---------- | :------------------ | :------------------------------------------------------------- |
| **FR-002**  | Partial Column Sync | Add only missing columns to existing table.                    |
| **FR-003**  | Large JSON Handling | Handle large file download and stream parsing (memory safety). |
| **FR-005**  | Bulk Validation     | Abort seed job if >10% of records fail Zod validation.         |

### Layer 4: E2E Journey
- **Voyage 1**: Container start → Check (Exit 1) → Migrate (Success) → Seed (Success) → Check (Exit 0).

## 3. Coverage Targets
- **@repo/appwrite (Migrations)**: 100% functional coverage.
- **appwrite-migrator (Seeder)**: 90% logic coverage.
- **Critical Mission Flows**: 100% E2E verification.

---
*Note: Once established, these tests are AUTHORITATIVE. They cannot be modified to align with implementation code without explicit justification.*
