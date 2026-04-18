# Epic-Level Task Checklist: Appwrite Migrator (Relational)

**Feature**: `010-appwrite-migrator` | **Global Rule**: All subtasks must pass `pnpm lint`, `pnpm typecheck`, and Vitest tests before completion.

## Implementation Protocol
- **Atomic Execution**: We will execute one **Subtask** at a time.
- **User Validation**: Each subtask requires user confirmation ("Done") before checking off and proceeding.
- **Continuous Hardening**: Guard validations (linting, typechecking, tests) must run at the end of every subtask.

---

## [Epic 1] Workspace & Core Foundations
Goal: Establish the clean-room workspace and extend core storage capabilities for remote synchronization.

### [Task T1.1] Workspace & Environment Setup
- [X] **S1.1.1** Initialize `apps/appwrite-migrator/` directory with `package.json`, `tsconfig.json`, and `src/` hierarchy optimized for Node 24 ESM.
- [X] **S1.1.2** Setup `pnpm` workspace links and install dependencies (linking [@repo/appwrite](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/packages/appwrite), [@repo/config](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/packages/config)).

### [Task T1.2] Core Capability Extension
- [X] **S1.2.1** Implement generic `download` in [@repo/appwrite/storage](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/packages/appwrite/src/services/storage.ts) to fetch any binary file data (Buffer) with total SDK concealment.

---

## [Epic 2] The Schema Blueprint & Registry
Goal: Formalize the Relational Tables structure for the entire project within the core package.

### [Task T2.1] Structural Definitions
- [X] **S2.1.1** Implement [blueprints.ts](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/packages/appwrite/src/migrations/blueprints.ts) in `packages/appwrite/src/migrations/` defining the declarative state for all Tables, Columns, and Indexes.

### [Task T2.2] Blueprint Integrity (Layer 1 Tests)
- [X] **S2.2.1** [P] [US1] Implement Layer 1 tests to verify blueprint integrity (Zod validation, regex naming, and relational consistency).

---

## [Epic 3] Relational Migration Engine (US1)
Goal: Build the idempotent engine responsible for aligning Appwrite structure with blueprints.

### [Task T3.1] Migration Logic Implementation
- [X] **S3.1.1** [US1] Implement [migration.ts](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/packages/appwrite/src/services/migration.ts) in `packages/appwrite/src/services/`.
- [X] **S3.1.2** [US1] Implement incremental diffing logic to calculate structural delta (missing tables, missing columns).
- [X] **S3.1.3** [US1] Implement idempotent application logic using TablesDB-aligned SDK calls.

### [Task T3.2] Engine Resilience (Layer 2 Tests)
- [X] **S3.2.1** [P] [US1] Verify Class 1, 3, 5, 8 scenarios (Happy Path, Invalid Blueprint, System Failure, Catastrophic 500) for the migration engine.

---

## [Epic 4] Independent Seeding Service (US2)
Goal: Build the separate service that synchronizes row data with full API-level validation.

### [Task T4.1] Seeder Engine Implementation
- [X] **S4.1.1** [US2] Implement [seeder.ts](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/apps/appwrite-migrator/src/services/seeder.ts) in `apps/appwrite-migrator/src/services/` with strict Zod validation per row.
- [X] **S4.1.2** [US2] Implement "API-level" validation logic (Email format, string constraints) for all seed records.
- [X] **S4.1.3** [US2] Implement Template & Doc Generation (JSON + Markdown) based on blueprints.
- [X] **S4.1.4** [US2] Implement Deduplication logic using `uniqueLogicKeys` for language-aware Upserts.

---

## [Epic 7] Advanced Configuration & Safety
Goal: Provide mechanisms for destructive changes and enterprise-grade safety.

### [Task T7.1] Authorized Destructive Changes
- [X] **S7.1.1** Implement [destructive-officer.ts](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/apps/appwrite-migrator/src/services/destructive-officer.ts) to manage the **Living State** protocol (Detection, Remote Update, Pruning).
- [X] **S7.1.2** Integrate [migration.ts](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/packages/appwrite/src/services/migration.ts) with the officer to execute deletions only for `true` boolean flags.

### [Task T4.2] Seeding Reliability (Layer 3 Tests)
- [X] **S4.2.1** [P] [US2] Verify Class 1, 2, 5 (Happy, Edge-Case Empty JSON, Rate Limiting 429) for the seeding service.

---

## [Epic 5] Node Script Interface & Status Reporting (US3)
Goal: Provide the entry point for script execution with clear status codes.

### [Task T5.1] Script Orchestration
- [X] **S5.1.1** [US3] Implement the main entry point in [index.ts](file:///home/tiagoluizpoli/01-dev-env/personal/portifolio/apps/appwrite-migrator/src/index.ts) with `MIGRATOR_MODE` dispatcher.
- [X] **S5.1.2** [US3] Implement "Fail-Fast" environment validation and Audit Check (0 = Sync, 1 = Error).
- [X] **S5.1.3** [US3] Orchestrate CLI flags for `--migrate`, `--seed`, `--template`, and `--check`.

---

## [Epic 6] Containerization & Final Polish
Goal: Ensure the migrator is production-ready for automated CI/CD environments.

### [Task T6.1] Production Packaging
- [X] **S6.1.1** Implement multi-stage `Dockerfile` using `node:24-alpine` optimized for pnpm workspaces.
- [x] **S6.1.2** Perform "Final Voyage" E2E integration test tracking full lifecycle including **Verification of SC-003** (Zero duplicate rows via `uniqueLogicKeys`).
