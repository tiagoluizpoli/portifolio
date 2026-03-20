# Appwrite 2026 Migration & Integration Guidelines

Follow these standards for all Appwrite-based infrastructure and data operations in the portfolio monorepo.

## 1. Database Operations (TablesDB)

- **Modern API**: Exclusively use the `TablesDB` client from the Appwrite SDK (v22+). 
- **Explicit Schema**: Do not rely on "on-demand" attribute creation. Tables and columns MUST be created explicitly via `createTable`, `createStringColumn`, etc.
- **Poll for Readiness**: Appwrite 1.8.1+ attribute creation is asynchronous. Always implement a polling loop (e.g., `waitForColumns`) before performing data ingestion.

## 2. Data Integrity & Transactions

- **Atomic Ingestion**: All batch operations MUST be wrapped in a transaction via `tables.createTransaction()`.
- **Automatic Rollback**: Any error in a migration row MUST trigger `tables.updateTransaction({ rollback: true })` to prevent partial data states.
- **Deterministic IDs**: Use slug-based `$id` generation (e.g., `skill-typescript`, `home-en`) to guarantee idempotency and prevent duplication on repeated runs.

## 3. Storage Management

- **Bucket Separation**: 
    - `assets`: Primary public-read bucket for portfolio media.
    - `trash`: Private bucket for orphaned files.
- **Mark-and-Sweep**: Implements a "Snapshot Move" policy. Orphaned files found during migration (unreferenced by the database) are moved to `trash` instead of being deleted.

## 4. Security & Permissions

- **Principle of Least Privilege**:
    - Public: `Role.any()` (Read-only).
    - Management: `Role.team(APPWRITE_CURATOR_TEAM_ID)` (Write/Create/Delete).
- **Zod Guardians**: All Appwrite environment variables MUST be validated at runtime via `@repo/appwrite-core` environment validators.

## 5. Development Workflow

- **Shared Core**: Shared logic (providers, validators) must live in `packages/appwrite-core`.
- **Linting**: Enforce zero-exception Biome rules for all Appwrite-related TypeScript.
- **Unit Testing**: All infrastructure managers MUST have Vitest suites with mocked Appwrite clients.
