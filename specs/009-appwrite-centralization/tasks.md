# Epic-Level Task Checklist: @repo/appwrite Centralization

**Feature**: `009-appwrite-centralization` | **Global Rule**: All subtasks must pass `pnpm lint`, `pnpm typecheck`, and Vitest tests before completion.

## Implementation Protocol
- **Atomic Execution**: We will execute one **Subtask** at a time.
- **User Validation**: Each subtask requires user confirmation ("Done") before checking off and proceeding.
- **Continuous Hardening**: Guard validations must run at the end of every subtask.

---

## [Epic 1] Package Infrastructure & Core Contracts
Goal: Establish the clean-room workspace and define the internal persistence bridge.

### [Task T1.1] Workspace & Environment Setup
- [X] **S1.1.1** Initialize `packages/appwrite/` directory with `package.json`, `tsconfig.json`, and `src/` hierarchy.
- [X] **S1.1.2** Install dependencies: `node-appwrite`, `zod`, `vitest`, `vitest-mock-extended`.
- [X] **S1.1.3** Configure `vitest.config.ts` with 100% coverage thresholds and `biome.json` for linting.

### [Task T1.2] Foundational Persistence Layer
- [X] **S1.2.1** Implement internal (non-exported) `IRepository` interface in `src/repositories/interfaces.ts`.
- [X] **S1.2.2** Implement bidirectional `DocumentMapper` utility in `src/utils/mapper.ts`.
- [X] **S1.2.3** Implement abstract `BaseRepository` with concrete overridable CRUD logic in `src/repositories/base.ts`.
- [X] **S1.2.4** Implement `InternalLogger` for latency and operation tracking in `src/utils/logger.ts`.

---

## [Epic 2] The Schema DSL Master (User Story 1)
Goal: Define all 11 entities with strict validation and property mapping.

### [Task T2.1] Model Definitions & Data Shapes
- [X] **S2.1.1** [US1] Implement Zod models for Section 1-5 (About, Home, Metrics, etc.) in `src/schemas/`.
- [X] **S2.1.2** [US1] Implement Zod models for Section 6-11 (Skills, History, etc.) in `src/schemas/`.
- [X] **S2.1.3** [UI1] Export normalized Domain Types (`Insert`, `Full`, `List`) from Zod registry.

### [Task T2.2] Schema DSL Verification (Mandatory Tests)
- [X] **S2.2.1** [P] [US1] Verify Class 1-3 (Happy/Edge/Invalid) for all 11 entities in `tests/schemas/`.

---

## [Epic 3] Generic Repository Implementation (User Story 2)
Goal: Provide clean, domain-driven entry points for all database collections.

### [Task T3.1] Specialized Repositories & Services
- [X] **S3.1.1** [US2] Implement all 11 exported repository classes extending `BaseRepository`.
- [X] **S3.1.2** [US2] Setup `StorageService` for Picture and PDF orchestration in `src/services/storage.ts`.

### [Task T3.2] Repository Reliability (Mandatory Tests)
- [X] **S3.2.1** [P] [US2] Verify Class 1, 2, 4, 5 (Happy, Edge, Auth, System) for repositories.

---

## [Epic 4] Ghost-Row Synchronization (User Story 3)
Goal: Implement the propagation engine with Serial with Rollback safety.

### [Task T4.1] MetricSync Service Engine
- [X] **S4.1.1** [US3] Implement `MetricSyncService` core propagation logic in `src/services/sync.ts`.
- [X] **S4.1.2** [US3] Implement "Serial with Rollback" compensating transaction (atomic parity).

### [Task T4.2] Synchronization Resilience (Mandatory Tests)
- [X] **S4.2.1** [P] [US3] Verify Class 1, 6, 7 (Happy, Concurrency, State Transitions) for sync engine.

---

## [Epic 5] Security Guardian & System Gates (User Story 4)
Goal: Encapsulate infrastructure logic and enforce safety at boot.

### [Task T5.1] AuthService & Environmental Gates
- [X] **S5.1.1** [US4] Implement standalone `AuthService` for session lifecycle in `src/services/auth.ts`.
- [X] **S5.1.2** [US4] Implement static "Global Env Validator" in package entry point (Crash-at-boot logic).

### [Task T5.2] Guardian Verification (Mandatory Tests)
- [X] **S5.2.1** [P] [US4] Verify Class 4, 5, 8 (Auth, System, Catastrophic) for security gates.

---

## [Epic 6] Polish & Parity Verification
Goal: Final audit and parity check against legacy implementation.

### [Task T6.1] Performance & Parity Audit
- [X] **S6.1.1** Implement `VerificationUtility` to compare shaped output vs existing `appwrite-core`.
- [X] **S6.1.2** Perform workspace link verification and final 100% coverage certification.

---

## [Epic 7] Centralized Environment Package & Consumption Flow
Goal: Introduce shared typed env-group loading and integrate it with Appwrite initialization.

### [Task T7.1] Shared `@repo/config` Package Foundation
- [X] **S7.1.1** Create `packages/config/` workspace package with `package.json`, `tsconfig.json`, and source layout.
- [X] **S7.1.2** Implement internal Zod group schemas and registry for supported groups in `packages/config/src/groups/*`.
- [X] **S7.1.3** Implement typed helper `getEnv({ group: true })` returning keyed requested-group objects in `packages/config/src/loader.ts`.

### [Task T7.2] Appwrite Integration Path
- [X] **S7.2.1** Update `@repo/appwrite` docs/contracts to consume explicit typed config from `@repo/config` outputs.
- [X] **S7.2.2** Add integration examples for Migrator/Web bootstraps (`@repo/config` -> `initializeAppwrite`) in quickstart docs.
- [X] **S7.2.3** Ensure `@repo/appwrite` remains explicit-init only (no implicit auto-initialize behavior).
- [x] **S7.2.4** Integrate `@repo/config` group helper into `apps/migrator` bootstrap and pass typed config into `initializeAppwrite`.
- [x] **S7.2.5** Integrate `@repo/config` group helper into `apps/zenith` server bootstrap for Appwrite client initialization.

### [Task T7.3] Centralization Verification (Mandatory Tests)
- [x] **S7.3.1** [P] Validate Class 1, 3, 8 scenarios for `@repo/config` helper (`packages/config/tests/**`).
- [x] **S7.3.2** [P] Validate cross-package integration of typed env output into Appwrite initialization.
