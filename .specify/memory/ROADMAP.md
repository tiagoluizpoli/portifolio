# Portfolio Refactor Roadmap

This roadmap defines the mandatory phases for the portfolio refactor. All feature specifications and implementation plans MUST align with these phases.

## Phase 1: Infrastructure & Monorepo Setup
- **Goal**: Transition to a `pnpm` monorepo.
- **Structure**:
    - `apps/portfolio`: Primary Landing Page (Vite 8, React 19, Tailwind 4+, Shadcn).
    - `apps/zenith`: Management & Admin Hub (TanStack Start v1, React 19, Tailwind 4+).
    - `apps/migrator`: AppWrite Schema Migrator & Seeding Tool (Node 22+, shared types).
    - `packages/shared`: Shared AppWrite logic, schemas, and types.

## Phase 2: AppWrite Migration
- **Goal**: Replace Directus with a fully typesafe AppWrite setup.
- **Tasks**:
    - Define AppWrite schema in code within `packages/shared`.
    - Implement `apps/migrator` for automated schema sync and data migration.
    - Migrate all Directus logic to AppWrite SDK/Functions.

## Phase 3: Zenith UI (Admin Management)
- **Goal**: Create a self-managed panel for content evolution (blog, projects, assets).
- **Tasks**:
    - Build `apps/zenith` using TanStack Start.
    - Implement type-safe forms for portfolio content management.
    - Integrate with AppWrite API for real-time updates and export/backup.

## Phase 4: Portfolio Landing Page & Design (Vite 8 + Shadcn)
- **Goal**: Update layout and simplify components.
- **Tasks**:
    - BASE DESIGN on inspirations in `/design-inspirations/`.
    - Implement clean, simplified landing page in `apps/portfolio`.
    - Edge technology upgrade: Vite 8 + Tailwind 4 + React 19.

---
**Note**: This roadmap is MANDATORY and must be considered in all spec interactions.
