# Quickstart: Zenith CMS Appwrite Wiring

## Overview
This feature wires the Zenith Portfolio Manager UI to the Appwrite backend using the Repository Pattern, TanStack Form, and TanStack Query.

## Deployment Steps
1. **Schema Migration**:
   ```bash
   cd apps/migrator
   pnpm dev --overwrite  # WARNING: This will apply the new naming to your local Appwrite
   ```
2. **Environment Variables**:
   Ensure `apps/zenith/.env` contains the correct `APPWRITE_DATABASE_ID` and `APPWRITE_PROJECT_ID`.

## Development Workflow
1. **Adding a New Repository**:
   - Create interface in `packages/appwrite-core/src/domain/repositories/`.
   - Implement in `packages/appwrite-core/src/infrastructure/repositories/`.
   - Map DB fields to Domain models in the implementation.
2. **Wiring a Section**:
   - Define Zod schema in `apps/zenith/app/features/cms/lib/validation.ts`.
   - Update the form component in `apps/zenith/app/features/cms/components/sections/` to use `TanStack Form`.
   - Wrap persistence calls in `apps/zenith/app/infrastructure/appwrite/server.ts` use cases.

## Key Files
- `packages/appwrite-core/src/infrastructure/repositories/`: All data access logic.
- `apps/zenith/app/features/cms/lib/validation.ts`: Central authority for form validation.
- `apps/zenith/app/infrastructure/appwrite/server.ts`: Server-side RPCs for persistence.
