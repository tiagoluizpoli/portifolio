# Zenith Constitution

## Core Principles

### I. Simplicity First
Keep the project minimal. Every component or feature must justify its existence. Avoid over-engineering.

### II. AppWrite-Centric
Rely fully on AppWrite features (Functions, Database, Auth). The `migrator` app is the sole authority for schema syncing, initial seeding, and data restoration.

### III. Monorepo Architecture
Maintain a clean monorepo structure using `pnpm`. Shared logic and types live in `@repo/appwrite-core`. Applications are categorized as `portfolio` (landing), `zenith` (admin), and `migrator` (infra).

### IV. Mandatory Roadmap Alignment
Every spec and implementation must align with the `ROADMAP.md` found in `.specify/memory/`.

### V. Design Source of Truth
Frontend designs MUST be based on inspirations located in the `/design-inspirations/` folder. This folder is mandatory context for all design tasks.

### VI. TypeScript & Type Safety
The entire codebase, including AppWrite schema definitions, must be fully typesafe and shared between services.

### VII. Self-Managed Evolution
The portfolio must evolve through the admin panel, avoiding manual database changes.

### VIII. Clean Code & SOLID
Every specification and implementation MUST strictly adhere to SOLID principles and Clean Code standards (meaningful naming, small functions, single responsibility, and testability). This is a non-negotiable core architectural constraint.

### IX. Mandatory Tooling
The project strictly mandates the use of **Biome** for all linting and formatting. **ESLint** and **Prettier** are explicitly forbidden. **Pre-commit** hooks and **Commitizen** (Conventional Commits) are mandatory for all contributions to maintain repository integrity.

### X. Quality Gating (Definition of Ready)
No implementation may begin until the corresponding specification (`spec.md`) and technical plan (`plan.md`) have been validated against a custom Quality Checklist. Every item in the checklist MUST be explicitly checked off (`[x]`) to signify that the requirements are complete, clear, and consistent.

## Governance
- The Roadmap and Constitution supersede all individual implementation decisions.
- Changes to the Roadmap or Constitution require explicit documentation and rationale.

**Version**: 1.3.0 | **Ratified**: 2026-03-19 | **Last Amended**: 2026-03-20
