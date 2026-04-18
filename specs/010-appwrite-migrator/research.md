# Research: Appwrite Migrator (Phase 2)

This document consolidates research findings for the implementation of the containerized Appwrite Migrator tool.

## Decisions

### 1. Appwrite Migrator Engine (Centralized in Package)
- **Decision**: All low-level Appwrite SDK interactions (`TablesDB`) for migrations MUST live inside the `@repo/appwrite` package.
- **Rationale**: Ensure "Infrastructure Invisibility" (Constitution XV) and maintain a single authority for SDK interactions.
- **Implementation**:
  - Add `MigrationService` to `@repo/appwrite` to handle schema diffing and application.
  - The `apps/appwrite-migrator` will call this service as a consumer.
  - **Zero SDK dependency in `apps/appwrite-migrator`**.

### 2. Seeding Logic (Consumer Pattern)
- **Decision**: The migrator app will use exposed `@repo/appwrite` repositories (e.g., `AboutRepository`, `SocialRepository`) to perform UPSERTs.
- **Rationale**: Leveraging formalized repo patterns ensures Zod validation and consistent data handling.

### 3. Containerization (Node 24 + pnpm)
- **Decision**: Use a multi-stage Docker build with pnpm.
- **Node Version**: `24-alpine`.
- **Rationale**: User specific requirement for Node 24.

### 4. Command Orchestration
- **Decision**: Use a simple `switch` dispatcher in `src/index.ts`.
- **Rationale**: The requirement is for a "simple Node application" that runs in a container and performs specific tasks. A complex interactive interface is explicitly out of scope.

## Alternatives Considered

- **Commander/Clack**: Evaluated for interaction experience, but rejected in favor of simple env-based orchestration to keep the image lightweight and the implementation "Simple First" (Constitution I).
- **Direct SDK usage in Migrator**: Rejected. Must use `@repo/appwrite` repositories and services to maintain "Infrastructure Invisibility" (Constitution XV).

## Open Questions Resolved

- **Permissions**: User confirmed they will manage permissions manually via the Appwrite console. The migrator will focus solely on structure and data.
