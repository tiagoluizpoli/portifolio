# Implementation Plan: Appwrite Migrator (Relational Alignment)

Build a containerized Node application (`apps/appwrite-migrator`) to orchestrate Appwrite schema synchronization and data seeding following the **TablesDB** relational paradigm. This script acts as the sole authority for infrastructure-as-code (IaC) within the Zenith ecosystem.

## Technical Context

| Context | Details |
| :--- | :--- |
| **Monorepo Root** | `/home/tiagoluizpoli/01-dev-env/personal/portifolio` |
| **New Workspace** | `apps/appwrite-migrator` |
| **Core Dependency** | `@repo/appwrite` (v22.1.3 TablesDB logic) |
| **Runtime** | Node.js 24+ (ESM) |
| **Infrastructure** | Appwrite v1.6+ (Relational Tables) |

## Constitution Check

| Principle | Rationale |
| :--- | :--- |
| **I. Simplicity First** | Minimalist orchestration using a `switch` dispatcher and environment variables. |
| **VIII. CLEAN CODE / SOLID** | **SRP**: `MigrationService` (in package) handles SDK. `MigratorApp` only orchestrates. |
| **XV. Infrastructure Invisibility** | **CRITICAL**: ZERO direct dependency on `node-appwrite` in the app layer. |
| **XVIII. Test-First** | **100% Coverage Mandate**: Success, Failure, and Edge cases verified by `test-plan.md`. |
| **CLEAN CODE** | Follow industrial standards: No God classes, separation of concerns. |

### 1. Relational Migration Service (`@repo/appwrite`)
Introduce a `MigrationService` that implements **Incremental Synchronization**:
- **Fetch State**: Retrieves existing Tables and Columns.
- **Diff Logic**: Calculates the delta between blueprints and remote state.
- **Total SDK Isolation**: The underlying Appwrite SDK is completely concealed within this service; consumers only see high-level results and status objects.
- **Remote Destructive Orchestration (Living State)**: 
    - Discrepancies (remote-only items) are automatically detected and added to `destructive-state.json` in the Appwrite bucket with a `false` flag.
    - **Atomic Safety**: The engine only executes deletion if the user manually flips a boolean to `true` in the remote file.
    - **Pruning**: Successfully destroyed items are automatically removed from the JSON file to maintain a clean record of current discrepancies.

### 2. Smart Seeder Engine (`apps/appwrite-migrator`)
A stateless engine for high-integrity data synchronization:
1. **Repository-First Sync**: Interacts with the database exclusively through package repositories to ensure consistency.
2. **Upsert-via-Logic**: Uses `uniqueLogicKeys` for deduplication across languages.
3. **Generic Storage**: Uses a unified `download` method to handle seed JSONs and other binary assets.
4. **Auto-IDs**: Supports optional row IDs with automatic Appwrite ID generation when omitted.

### 3. Containerization
Multi-stage `Dockerfile` (node:24-alpine) optimized for pnpm workspaces.

## Proposed Changes

### [appwrite-migrator]

#### [NEW] [index.ts](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/apps/appwrite-migrator/src/index.ts)
- Orchestration layer with support for `--migrate`, `--seed`, `--check`, and `--template`.

#### [NEW] [services/seeder.ts](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/apps/appwrite-migrator/src/services/seeder.ts)
- Multi-language aware sync logic with `uniqueLogicKeys` deduplication.
- Logic to upload/update the Seed Template and Markdown Spec to the remote bucket.

#### [NEW] [services/destructive-officer.ts](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/apps/appwrite-migrator/src/services/destructive-officer.ts)
- Manages the **Living State** protocol: detects discrepancies, updates the remote `destructive-state.json`, and prunes successful deletions.

---

### [@repo/appwrite]

#### [MODIFY] [blueprints.ts](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/packages/appwrite/src/migrations/blueprints.ts)
- Transition to `TableBlueprint` terminology.
- Add `uniqueLogicKeys` for language-aware deduplication.

#### [NEW] [migration.ts](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/packages/appwrite/src/services/migration.ts)
- Authority for incremental schema synchronization.

## Open Questions

- None. (User confirmed permissions to be managed via Console).

## Roadmap

1. **Phase 1: Foundation**: Blueprints (Relational) and Layer 1 Validation Suite.
2. **Phase 2: Sync Engine**: Incremental `MigrationService` with diffing and destructive whitelist.
3. **Phase 3: Smart Seeder**: Row deduplication (Unique Logic Keys), Auto-IDs, and Multi-layer templates.
4. **Phase 4: Orchestration**: CLI interface with `--check` and `--template` capabilities.
5. **Phase 5: Hardening**: **100% Test Coverage** and multi-stage containerization.

## Verification Plan

### Automated Tests
- `pnpm test` with 100% coverage target.
- Manual verification of JSON/MD template generation.

### Manual Verification
- Deploy to test project and verify that adding columns in code reflects correctly remote without state loss.
