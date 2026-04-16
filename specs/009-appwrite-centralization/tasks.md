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
- [ ] **S1.1.1** Initialize `packages/appwrite/` directory with `package.json`, `tsconfig.json`, and `src/` hierarchy.
- [ ] **S1.1.2** Install dependencies: `node-appwrite`, `zod`, `vitest`, `vitest-mock-extended`.
- [ ] **S1.1.3** Configure `vitest.config.ts` with 100% coverage thresholds and `biome.json` for linting.

### [Task T1.2] Foundational Persistence Layer
- [ ] **S1.2.1** Implement internal (non-exported) `IRepository` interface in `src/repositories/interfaces.ts`.
- [ ] **S1.2.2** Implement bidirectional `DocumentMapper` utility in `src/utils/mapper.ts`.
- [ ] **S1.2.3** Implement abstract `BaseRepository` with concrete overridable CRUD logic in `src/repositories/base.ts`.
- [ ] **S1.2.4** Implement `InternalLogger` for latency and operation tracking in `src/utils/logger.ts`.

---

## [Epic 2] The Schema DSL Master (User Story 1)
Goal: Define all 11 entities with strict validation and property mapping.

### [Task T2.1] Model Definitions & Data Shapes
- [ ] **S2.1.1** [US1] Implement Zod models for Section 1-5 (About, Home, Metrics, etc.) in `src/schemas/`.
- [ ] **S2.1.2** [US1] Implement Zod models for Section 6-11 (Skills, History, etc.) in `src/schemas/`.
- [ ] **S2.1.3** [UI1] Export normalized Domain Types (`Insert`, `Full`, `List`) from Zod registry.

### [Task T2.2] Schema DSL Verification (Mandatory Tests)
- [ ] **S2.2.1** [P] [US1] Verify Class 1-3 (Happy/Edge/Invalid) for all 11 entities in `tests/schemas/`.

---

## [Epic 3] Generic Repository Implementation (User Story 2)
Goal: Provide clean, domain-driven entry points for all database collections.

### [Task T3.1] Specialized Repositories & Services
- [ ] **S3.1.1** [US2] Implement all 11 exported repository classes extending `BaseRepository`.
- [ ] **S3.1.2** [US2] Setup `StorageService` for Picture and PDF orchestration in `src/services/storage.ts`.

### [Task T3.2] Repository Reliability (Mandatory Tests)
- [ ] **S3.2.1** [P] [US2] Verify Class 1, 2, 4, 5 (Happy, Edge, Auth, System) for repositories.

---

## [Epic 4] Ghost-Row Synchronization (User Story 3)
Goal: Implement the propagation engine with Serial with Rollback safety.

### [Task T4.1] MetricSync Service Engine
- [ ] **S4.1.1** [US3] Implement `MetricSyncService` core propagation logic in `src/services/sync.ts`.
- [ ] **S4.1.2** [US3] Implement "Serial with Rollback" compensating transaction (atomic parity).

### [Task T4.2] Synchronization Resilience (Mandatory Tests)
- [ ] **S4.2.1** [P] [US3] Verify Class 1, 6, 7 (Happy, Concurrency, State Transitions) for sync engine.

---

## [Epic 5] Security Guardian & System Gates (User Story 4)
Goal: Encapsulate infrastructure logic and enforce safety at boot.

### [Task T5.1] AuthService & Environmental Gates
- [ ] **S5.1.1** [US4] Implement standalone `AuthService` for session lifecycle in `src/services/auth.ts`.
- [ ] **S5.1.2** [US4] Implement static "Global Env Validator" in package entry point (Crash-at-boot logic).

### [Task T5.2] Guardian Verification (Mandatory Tests)
- [ ] **S5.2.1** [P] [US4] Verify Class 4, 5, 8 (Auth, System, Catastrophic) for security gates.

---

## [Epic 6] Polish & Parity Verification
Goal: Final audit and parity check against legacy implementation.

### [Task T6.1] Performance & Parity Audit
- [ ] **S6.1.1** Implement `VerificationUtility` to compare shaped output vs existing `appwrite-core`.
- [ ] **S6.1.2** Perform workspace link verification and final 100% coverage certification.
