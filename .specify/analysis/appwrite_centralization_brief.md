# Project Zenith: Appwrite Logic Centralization & Architectural Decoupling

## Context
Refactor the existing Appwrite integration which is currently scattered and "mingled" across the codebase. The goal is to move all Appwrite-related logic into a dedicated package, create a robust CLI migration/seeding tool, and decouple the Zenith CMS frontend from monolithic context-based data fetching. This transformation must be executed via test-driven, parallel implementations to ensure zero regressions.

## Specialists Engaged
*   **Appwrite Specialist** (`appwrite`): Primary driver for database modeling, Zod-first validation, and repository patterns.
*   **TanStack Master** (`tanstack-master`): Lead for refactoring Zenith's data fetching into modular, section-specific queries and mutations.
*   **Test Master** (`test-master`): Responsible for the "Tests-First" safety layer and ensuring implementation parity.
*   **React Architect** (`react-architect`): Advisory for decomposing the Zenith CMS context into component-level logic (Composite Pattern).
*   **Speckit Specify/Plan** (`speckit-specify`, `speckit-plan`): Roadmap governance for the three-phase specification split.

## Technical Requirements

### 1. Centralized `@portifolio/appwrite` Package
*   **Schema Layer**: Define Database/Table schemas using the Appwrite SDK/Node.
*   **Validation Layer**: Comprehensive Zod schemas for all data shapes:
    *   `Insert/Update`: Omit metadata fields (`id`, timestamps).
    *   `Full`: Complete record with system fields.
    *   `List`: Paginated/Cursor-based schemas.
*   **Type Layer**: TypeScript types strictly derived from Zod schemas (`z.infer`).
*   **Repository Layer**: Strongly typed repositories for Database and Storage operations.
*   **Storage Orchestration**: Generic Storage Service for file operations, handling specific behaviors for Pictures vs. PDFs where applicable.
*   **Helper Services**: Dedicated services for Metric Synchronization and Auth logic.

### 2. Migrator CLI Service
*   **Interface**: Acts as a consumer of the `@portifolio/appwrite` package services.
*   **Operations**: CLI implementation for CRUD (Database/Collections) and Infrastructure migrations (Database/Bucket versions).
*   **Seeding Engine**: Transform legacy JSON data into the new schema structure and seed the database/storage via exposed package services.

### 3. Zenith CMS Refactoring
*   **Decoupling**: Purge the "monolithic CMS context" pattern.
*   **Sectional Logic**: Each UI section must manage its own queries, mutations, and local state.
*   **Repository Consumption**: Direct interaction between frontend sections and the centralized Appwrite package/repositories.

## Success Criteria
*   **Parity**: All existing functionality works exactly as before (verified by pre-refactoring tests).
*   **Type Safety**: Zero `any` usages; 100% Zod-backed TypeScript interfaces.
*   **Maintainability**: Components ≤ 300 lines; Appwrite logic uniquely contained in the dedicated package.
*   **Test Coverage**: 100% coverage on new repository and service layers.
*   **Deployment**: Zero-downtime swap of old logic for the new implementation via parallel implementation strategy.

## Governance
*   **Named Exports Only**: No `export default` allowed for better refactoring/tree-shaking.
*   **Composite Pattern**: Mandatory decomposition for components exceeding 300 lines.
*   **Parallel Pathing**: Maintain parallel file structures (e.g., `UserService.ts` vs `UserService.new.ts`) until verified by tests.
*   **Test-First Discipline**: Baseline tests must be written against the *current* working state before a single line of implementation logic is changed.

## Implementation Roadmap (3-Part Specification)
1.  **Spec A: The Appwrite Package**: Core schema, types, Zod validation, and Repositories.
2.  **Spec B: The Migrator CLI**: Seeding logic, legacy data transformation, and infrastructure commands.
3.  **Spec C: Zenith Integration**: Frontend refactoring, context decomposition, and Section-level TanStack Query implementation.
