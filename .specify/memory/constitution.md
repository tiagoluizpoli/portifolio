<!--
Sync Impact Report:
- Version change: 1.9.0 → 2.0.0
- Added sections: None
- Modified principles: XVIII (Architecture-Level Test Plans - Hardened to MANDATORY), XXI (Test Immutability - Hardened to AUTHORITATIVE)
-->

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

### XI. Monorepo Integrity
To maintain a clean and unified version history, the project strictly uses a single Git repository at the root. Nested Git repositories (git-in-git) are explicitly forbidden. Initializers or CLI tools that create `.git` folders in subdirectories must have those folders removed immediately to ensure all versioning is handled exclusively via the root workspace.

### XII. Mandatory Quality Gating for Completion
No task or feature implementation is considered "Done" until the following checks pass with zero errors in the affected workspaces, using the scripts defined in their `package.json`:
1. **Linting & Formatting**: `pnpm biome check .` (or `pnpm lint`)
2. **Type Safety**: `pnpm typecheck`
3. **Automated Testing**: All relevant unit and integration tests pass (`pnpm test`).
This gate is mandatory and MUST be verified before notifying the user of completion.

### XIII. AppWrite 2026 Standards (Transactions & TablesDB)
**Definition**: All Appwrite interactions MUST use the v22+ `TablesDB` service, strictly follow the object-parameter style, and ensure transactional integrity for multi-stage data operations. Asynchronous attribute creation MUST be managed via polling.

### XIV. Monorepo Integrity (Single VCS)
**Definition**: The project MUST maintain a single, unified Git history at the root level. Nested `.git` directories or decoupled version control within `apps/` or `packages/` are STRICTLY FORBIDDEN. All dependencies and versioning are managed through the central monorepo root.

### XV. Infrastructure Invisibility
**Definition**: Applications MUST NOT interact with infrastructure implementations (Repositories, SDKs) directly. High-level Application Services or Use Cases PROVIDED BY THE CORE MUST be the sole entry points for data operations and state management.

### XVI. TanStack RC Standards (Native Latest)
**Definition**: All TanStack Start and Router implementations MUST strictly adhere to the Version 1 Release Candidate (RC) standards. This mandates:
1. **Native Latest Synchronization**: All `@tanstack/*` packages in a workspace MUST use the `latest` tag in `package.json` to ensure the most recent RC features and bugfixes are utilized. `pnpm.overrides` are discouraged unless a critical regression is identified.
2. **Pure Vite Architecture**: Deference to the `@tanstack/start-vite-plugin` instead of external orchestrators.
3. **Guideline Adherence**: All code must comply with the monolithic [TanStack Guideline](file:///home/tiago/01-dev-env/personal-repos/portifolio/.specify/memory/guidelines/tanstack_start_v1.md).

### XVII. Google Stitch Synergy
**Definition**: All frontend planning, research, design, and implementation tasks MUST leverage the Google Stitch MCP connection and its specialized skills (`stitch-design`, etc.). This process MUST strictly follow the [UI Generation Workflow](file:///home/tiago/01-dev-env/personal-repos/portifolio/.specify/memory/guidelines/ui-generation-workflow.md), which mandates:
1. **Iterative Design-First**: Visual authoritative baselines must be generated via Stitch.
2. **Mandatory User Approval**: No implementation code may be written until the corresponding screen design is approved by the user.
3. **Per-Screen Documentation**: Every screen must have its own `DESIGN.md` for full traceability.
Every technical plan or frontend task must prioritize Stitch-generated designs as the authoritative baseline for implementation.

### XVIII. Mandatory Test-First Architecture
**Definition**: No feature implementation may begin without a completed `test-plan.md`. Testing is a mandatory architectural constraint. Every functional requirement (FR) MUST have a corresponding test case (Unit/Integration) and every user story (US) MUST have a corresponding E2E validation journey before a single line of production code is written.

### XIX. Explicit SOLID Mapping
**Definition**: Every high-level technical design MUST explicitly state which SOLID principles are being applied and how. Rationale such as "Following Single Responsibility Principle to isolate data fetching from UI rendering" is mandatory to ensure architectural clarity and maintainability.

### XX. Security Boundary Mapping
**Definition**: All features involving data mutation or sensitive access MUST include a explicit "Security Boundary Map." This identifies which logic is strictly handled by the server (Server Functions) and which is client-side (Standard React). The default state for UI is CLIENT-SIDE, while the default state for data integrity is SERVER-SIDE.

### XXI. Test Immutability
**Definition**: Automated tests are the authoritative source of truth for feature behavior. Once established, tests are IMMUTABLE. They cannot be modified to align with implementation code without an explicit justification provided to the user. Tests ENFORCE correctness, they do not follow code.

## Governance
- The Roadmap and Constitution supersede all individual implementation decisions.
- Changes to the Roadmap or Constitution require explicit documentation and rationale.

**Version**: 2.0.0 | **Ratified**: 2026-04-10 | **Last Amended**: 2026-04-10
