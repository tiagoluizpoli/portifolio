# Technical Implementation Plan: Appwrite Infrastructure and Migration

## 1. Core Architecture

- **TablesDB (2026)**: Implementation follows the mandatory TablesDB standard for Appwrite 1.8.1+. All collections are created explicitly with typed attributes and Team-level write permissions.
- **Transactional Seeding**: To guarantee data integrity, all migration batches are wrapped in `tables.createTransaction()`. A failure in any row (e.g., validation error) triggers a full atomic rollback.
- **Snapshot Move (Asset Lifecycle)**: Implements a "Mark-and-Sweep" policy for storage management. Orphaned assets are moved to a `trash` bucket instead of permanent deletion.

## 2. Infrastructure Layer (`packages/appwrite-core`)

- **Environment Sentinel**: Implements `env.validator.ts` using Zod for strict validation of `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, and `APPWRITE_CURATOR_TEAM_ID`.
- **AppwriteProvider**: Centralized singleton providing access to `TablesDB`, `Storage`, and `Teams` clients with integrated permission logic.

## 3. Application Layer (`apps/migrator`)

- **SchemaManager**: Automated provisioning of 7 core tables:
    - `home`, `experience`, `education`, `skills`, `solutions`, `socials`, `contact_info`.
    - Handles asynchronous Appwrite schema creation through polling synchronization.
- **DataParser**: High-fidelity mapping logic from Directus export to Appwrite documents:
    - Flattens nested `translations` objects.
    - Generates deterministic slug-based `$id` attributes for all documents.
- **AssetManager**: Handles downloading from Directus/Live and uploading to Appwrite with dynamic ID reference updates.

## 4. Verification Strategy

- **Dry Run Verification**: Use `--skip` flag to verify that existing data is recognized and not duplicated.
- **Data Integrity Audit**: Post-migration script to verify all 38+ technical skills are correctly categorized and present in the `skills` table.
- **Unit Testing**: Vitest suite targeting:
    - `DataParser` (mapping logic).
    - `SchemaManager` (attribute creation).
    - `MigratePortfolioUseCase` (transactional rollback behavior).
