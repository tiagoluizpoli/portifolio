# [PORTFOLIO] Constitution

## Core Principles

### I. Simplicity First
Keep the project minimal. Every component or feature must justify its existence. Avoid over-engineering.

### II. AppWrite-Centric
Rely fully on AppWrite features (Functions, Database, Auth). Move external API logic to AppWrite Functions.

### III. Monorepo Architecture
Maintain a clean monorepo structure using `pnpm`. Shared logic and types must live in semantic packages like `@repo/appwrite-core`.

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

## Governance
- The Roadmap and Constitution supersede all individual implementation decisions.
- Changes to the Roadmap or Constitution require explicit documentation and rationale.

**Version**: 1.1.0 | **Ratified**: 2026-03-19 | **Last Amended**: 2026-03-19
