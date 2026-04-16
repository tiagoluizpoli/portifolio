# Project Zenith: Appwrite Logic Centralization (Updated Specification Brief)

## Context
Refactor and formalize the Appwrite integration by centralizing all logic into a dedicated `@portifolio/appwrite` package, building a robust CLI migrator/seeding tool, and decomposing the Zenith CMS context into modular, section-specific data handlers.

## Specialists Engaged
*   **Appwrite Specialist** (`appwrite`): Lead for database/storage modeling and Zod-first validation.
*   **TanStack Master** (`tanstack-master`): Lead for Zenith's query/mutation decoupling.
*   **Test Master** (`test-master`): Architect for backfill parity testing and parallel file verification.
*   **DX Architect**: Specialist in TypeScript CLI patterns (for the Migrator tool).
*   **Speckit Specify**: Protocol driver for the 3-part specification split.

## Technical Requirements (Expanded)

### 1. Appwrite Package (`@portifolio/appwrite`)
*   **Drizzle-like Schemas**: Use Appwrite SDK to define table/bucket structures as code.
*   **Versioned Data Shapes**:
    *   `Zod schemas` for `insert`, `full`, and `list` (pagination/cursor) shapes.
    *   `TypeScript types` automatically inferred from Zod.
*   **Repository Pattern**: Strictly typed repositories (Database, Storage, Auth).
*   **Helper Services**: Robust orchestration for Metric Sync and Storage operations (handling Pic vs. PDF nuances).

### 2. Migrator CLI Tool
*   **Tech Stack**: TypeScript-first CLI with interactive experience (e.g., using `commander` or `clack`).
*   **Commands**:
    *   `db:init/migrate/seed`: Handle collection lifecycles.
    *   `bucket:init/migrate`: Handle storage lifecycles.
*   **Seed Engine**: Consume legacy JSON → Transform to Appwrite package types → Sync via Repositories.

### 3. Zenith Project Refinement
*   **Context Purge**: Remove monolithic CMS context.
*   **Section Isolation**: Each UI section imports and handles its own repository interactions via TanStack hooks.
*   **Unified Interface**: Sections consume unified Appwrite operation files, ensuring consistency while maintaining separation of concerns.

## Success Criteria & Governance
*   **100% Type Parity**: No deviation from the current Appwrite state during normalization.
*   **Zero-Regression Guard**: Parallel implementation (`*.new.ts`) verified by exact-match parity tests before cutover.
*   **Project Constitution**: Named exports, <300 line components, and 4px grid compliance.
*   **Test-Backed Seeds**: Verify legacy data integrity after transformation through the new seed engine.

## Implementation Roadmap
*   **Phase 1**: `@portifolio/appwrite` package (Schemas, Zod, Repositories).
*   **Phase 2**: Migrator CLI (Database lifecycle, Seed engine).
*   **Phase 3**: Zenith Decoupling (Section-level logic refactor).
