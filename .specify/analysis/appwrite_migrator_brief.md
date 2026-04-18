# Appwrite Migrator (Phase 2): Containerized Migration & Seeding Tool

## Context
Transition the previously planned CLI migrator into a specialized Node.js application designed to run within a containerized environment (e.g., Docker/Kubernetes) during the deployment pipeline. This tool is responsible for formalizing the Appwrite database/storage lifecycle by applying schema migrations and synchronizing legacy data through the `@portifolio/appwrite` package.

## Specialists Engaged
- **Appwrite Specialist** (`appwrite`): Expertise in database/storage modeling and SDK v22.1.3 logic.
- **DX Architect**: Expertise in TypeScript orchestration, containerized script patterns, and dependency isolation.
- **Test Master** (`test-master`): Expertise in data integrity verification and post-migration validation.

## Technical Requirements
- **Runtime**: Node.js (TypeScript-first) running in a container.
- **Dependencies**: 
  - Strictly dependent on `@portifolio/appwrite` for all database, storage, and auth operations.
  - Zero direct SDK calls outside of the package's boundary.
- **Execution Model**:
  - `check`: Detect if migrations are required.
  - `migrate`: Apply pending schema changes (Collections, Attributes, Indexes, Buckets).
  - `seed`: Synchronize data from the latest legacy JSON source using Appwrite repositories.
  - **Auto-Die**: The process must terminate gracefully with status code 0 on success or >0 on failure.
- **Data Source**: Consume and transform an updated version of the legacy JSON file.
- **Environment**: Must respect environment variables for Appwrite endpoint, project, and API key (provided via container runtime).

## Success Criteria
- **Atomic Operations**: Migrations must either complete fully or fail cleanly without leaving the instance in a corrupt state.
- **Data Integrity**: 100% of records from the legacy JSON must be successfully synced (verified by post-seed count validation).
- **Graceful Termination**: Mandatory exit codes for CI/CD pipeline integration.
- **Type Safety**: Full integration with Zod schemas defined in `@portifolio/appwrite`.

## Governance
- **Components**: ≤ 300 lines. Above → Composite Pattern decomposition.
- **Exports**: Named only. No `export default`.
- **Types**: Full type safety. No `any`, no `as` casts.
- **Safety**: Non-destructive migrations (append/update only where possible, explicit confirmation required for destructive actions if any).
