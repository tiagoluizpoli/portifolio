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
- `zod` (for runtime validation)

#### [NEW] [.env.example](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/.env.example)
Define mandatory `VITE_` public variables and secret `APPWRITE_API_KEY`.

#### [NEW] [app.config.ts](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/app.config.ts)
Vite/Nitro configuration for TanStack Start.

#### [NEW] [src/index.css](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/src/index.css)
Main CSS entry points using Tailwind v4 `@import "tailwindcss";` and OKLCH-based `@theme` tokens.

#### [NEW] [src/routes/__root.tsx](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/src/routes/__root.tsx)
Root route with metadata hoisting and global styles.

#### [NEW] [src/infrastructure/appwrite/server.ts](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/src/infrastructure/appwrite/server.ts)
Base server functions for secure AppWrite access using Zod validation.

#### [NEW] [src/routes/error/startup.tsx](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/src/routes/error/startup.tsx)
Specialized error page to display missing environment variables and links to setup documentation.

#### [NEW] [src/components/client-only.tsx](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/src/components/client-only.tsx)
Implement the `<ClientOnly />` wrapper component using the `useHydrated` hook.

---

### [Phase 2: AppWrite Core Enhancement]
#### [NEW] [Repositories](file:///home/tiago/01-dev-env/personal-repos/portifolio/packages/appwrite-core/src/infrastructure/repositories)
Centralized types, models, and repositories for AppWrite CRUD. Use **Zod schemas** as the source of truth.

#### [NEW] [Exceptions](file:///home/tiago/01-dev-env/personal-repos/portifolio/packages/appwrite-core/src/domain/exceptions)
Robust error mapping for permissions and SDK failures.

#### [NEW] [src/config/env.ts](file:///home/tiago/01-dev-env/personal-repos/portifolio/apps/zenith/src/config/env.ts)
Implement fail-fast validation logic (presence/format only) for all required environment variables within the Zenith app.

---

## Verification Plan

### Automated Tests
- `pnpm install`: Link workspaces.
- `pnpm --filter zenith biome check .`: Verify Biome compliance.
- `pnpm --filter zenith typecheck`: Verify React 19 / TanStack Start types.

### Manual Verification
- Verify `pnpm --filter zenith dev` starts successfully.
- Confirm Shadcn `Button` renders with OKLCH Tailwind 4 styles.
- **Security Audit (SC-004)**: Manually inspect the `zenith` client-side JS bundle for any plaintext AppWrite API keys.
- **Startup Failure Test**: Temporarily rename `.env` and verify the `startup.tsx` error page displays missing variables and doc links.
