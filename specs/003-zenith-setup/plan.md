# Implementation Plan: Zenith Setup

## Goal Description
Initialize the **Zenith** hub using **TanStack Start v1**, **React 19**, and **Tailwind CSS v4**. This phase establishes the foundation for a secure, type-safe, and visually premium administrative board.

## Technical Context
- **Feature Spec**: `specs/003-zenith-setup/spec.md`
- **Guidelines**: `.specify/memory/zenith_guidelines_2026.md`
- **Existing Ref**: `001-monorepo-structure`

## Proposed Changes

---

### [App: Zenith]

#### [NEW] [package.json](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/package.json)
Initialize `@tanstack/start` with:
- `@tanstack/react-router`
- `@tanstack/start`
- `react@19`
- `react-dom@19`
- `tailwindcss@4`
- `@tailwindcss/vite`

#### [NEW] [app.config.ts](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/app.config.ts)
Vite/Nitro configuration for TanStack Start.

#### [NEW] [src/index.css](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/src/index.css)
Main CSS entry points using Tailwind v4 `@import "tailwindcss";` and `@theme`.

#### [NEW] [src/routes/__root.tsx](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/src/routes/__root.tsx)
Root route with metadata hoisting and global styles.

#### [NEW] [src/infrastructure/appwrite/server.ts](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/src/infrastructure/appwrite/server.ts)
Base server functions for secure AppWrite access. Ensure React 19 compatibility (e.g., direct `ref` usage in UI).

#### [NEW] [src/routes/error/startup.tsx](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/src/routes/error/startup.tsx)
Specialized error page to display missing environment variables during fail-fast validation.

#### [NEW] [src/hooks/use-hydrated.ts](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/src/hooks/use-hydrated.ts)
Implement the `useHydrated` hook to safely handle client-only rendering and prevent hydration errors.

---

### [Phase 1.5: AppWrite Core Enhancement]
#### [NEW] [Repositories](file:///home/tiago/01-dev-env/personal-repos/portifolio/packages/appwrite-core/src/infrastructure/repositories)
Centralized types, models, and repositories for AppWrite CRUD.

#### [NEW] [Exceptions](file:///home/tiago/01-dev-env/personal-repos/portifolio/packages/appwrite-core/src/domain/exceptions)
Robust error mapping for permissions and SDK failures.

#### [NEW] [src/config/env.ts](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/src/config/env.ts)
Implement fail-fast validation logic for all required environment variables within the Zenith app.

---

## Verification Plan

### Automated Tests
- `pnpm install`: Link workspaces.
- `pnpm --filter zenith biome check .`: Verify Biome compliance.
- `pnpm --filter zenith typecheck`: Verify React 19 / TanStack Start types.

### Manual Verification
- Verify `pnpm --filter zenith dev` starts successfully.
- Confirm Shadcn `Button` renders with Tailwind 4 styles correctly.
- **Security Audit (SC-004)**: Manually inspect the `zenith` client-side JS bundle for any plaintext AppWrite API keys.
- **Startup Failure Test**: Temporarily rename `.env` and verify the `startup.tsx` error page displays the missing variables.
