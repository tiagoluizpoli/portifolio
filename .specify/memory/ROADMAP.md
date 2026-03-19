# Portfolio Refactor Roadmap

This roadmap defines the mandatory phases for the portfolio refactor. All feature specifications and implementation plans MUST align with these phases.

## Phase 1: Infrastructure & Monorepo Setup
- **Goal**: Transition to a `pnpm` monorepo.
- **Structure**:
    - `apps/web`: Landing Page (Vite 8, React 19, Tailwind 4+, Shadcn).
    - `apps/admin`: Management Panel (TanStack Start v1, React 19, Tailwind 4+).
    - `apps/migrator`: AppWrite Schema Migrator (Node 22+, shared types).
    - `packages/shared`: Shared AppWrite logic, schemas, and types.

## Phase 2: AppWrite Migration
- **Goal**: Replace Directus with a fully typesafe AppWrite setup.
- **Tasks**:
    - Define AppWrite schema in code within `packages/shared`.
    - Implement `apps/migrator` for automated schema sync and data migration.
    - Migrate all Directus logic to AppWrite SDK/Functions.

## Phase 3: Administrative UI (TanStack Start)
- **Goal**: Create a self-managed panel for content evolution.
- **Tasks**:
    - Build `apps/admin` using TanStack Start.
    - Implement type-safe forms for portfolio content management.
    - Integrate with AppWrite API for real-time updates.

## Phase 4: Landing Page & Design (Vite 8 + Shadcn)
- **Goal**: Update layout and simplify components.
- **Tasks**:
    - BASE DESIGN on inspirations in `/design-inspirations/`.
    - Implement clean, simplified landing page in `apps/web`.
    - Edge technology upgrade: Vite 8 + Tailwind 4 + React 19.

---
**Note**: This roadmap is MANDATORY and must be considered in all spec interactions.
