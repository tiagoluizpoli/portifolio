# Implementation Plan: Appwrite Central Logic Package (@repo/appwrite)

**Branch**: `009-appwrite-centralization` | **Date**: 2026-04-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-appwrite-centralization/spec.md`

## Summary
Implement a high-fidelity, clean-room Appwrite package (`@repo/appwrite`) plus a shared configuration package (`@repo/config`) for centralized typed environment resolution. The architecture keeps explicit Appwrite initialization while moving env parsing/validation into a typed group-loader helper. `@repo/appwrite` continues the **three-layer repository pattern** and mapper-based normalization with 100% test coverage.

## Technical Context

**Language/Version**: TypeScript 5.4+  
**Primary Dependencies**: `node-appwrite` v3+, `zod`, `vitest`  
**Storage**: Appwrite (Database, Buckets, Auth)  
**Testing**: Vitest (100% Coverage Thresholds)  
**Target Platform**: Node.js (Server-side)
**Project Type**: Library (pnpm workspace packages)  
**Performance Goals**: Latency-monitored repository calls (FR-PKG-009)  
**Constraints**: Zero-SDK leakage, explicit client initialization, named exports only, <300 line components.  
**Scale/Scope**: Unified gateway for Zenith CMS, Migrator CLI, and future portfolio apps with centralized env validation.

## Constitution Check

| Gate               | Status | Detail                                                           |
| :----------------- | :----- | :--------------------------------------------------------------- |
| **Named Exports**  | PASS   | All package entry points use strictly named exports.             |
| **Type Safety**    | PASS   | Zero `any` usage; Zod source-of-truth for all models.            |
| **300-Line Limit** | PASS   | Repositories and Services decompose into small, focused modules. |
| **Grid Protocol**  | N/A    | Logic-only package.                                              |
| **Spring Motion**  | N/A    | Logic-only package.                                              |

## Project Structure

### Documentation (this feature)
```text
specs/009-appwrite-centralization/
├── spec.md              # Requirements and User Stories
├── plan.md              # Phase 2 implementation summary
├── research.md          # Zod normalization & extensibility research
├── data-model.md        # Normalized entity definitions
├── quickstart.md        # Technical usage guide
├── test-plan.md         # 100% coverage strategy
└── contracts/           # Public interface definitions
```

### Source Code Layout
```text
packages/appwrite/
├── src/
│   ├── client.ts        # Appwrite SDK client factory
│   ├── schemas/         # Zod DSL & Transformations
│   ├── repositories/    # Base & Concrete repositories
│   ├── services/        # MetricSync, Auth, Storage
│   ├── errors/          # Domain exception mapping
│   ├── utils/           # Parity verification & loggers
│   └── index.ts         # Public API (Normalized exports)

packages/config/
├── src/
│   ├── groups/          # Internal group schemas (appwrite, db, etc.)
│   ├── loader.ts        # getEnv({ group: true }) typed helper
│   └── index.ts         # Public API
└── tests/               # Group validation and fail-fast tests
```

**Structure Decision**: Clean-room `pnpm` packages in `packages/appwrite` and `packages/config`. This avoids duplicated env checks and keeps Appwrite initialization explicit and deterministic.

## Complexity Tracking

| Violation         | Why Needed                 | Simpler Alternative Rejected Because                                                                                   |
| ----------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Mapper Pattern    | $id -> id normalization    | Decouples Zod validation from transformation logic.                                                                    |
| Three-Layer Repos | Encapsulation              | Keeps the base `IRepository` internal while exposing overridable `BaseRepository` logic via exported concrete classes. |
| Inheritance       | BaseRepository             | Composition-only requires too much boilerplate for standard CRUD across 11 collections.                                |
| Group Loader API  | Single consumer entrypoint | Exposing each loader publicly increases API surface and duplicates call conventions in apps.                           |

## Architecture Addendum: Configuration Flow

1. Consumer app calls `getEnv({ appwrite: true })` from `@repo/config`.
2. `@repo/config` validates all requested groups with Zod and fails fast on missing/invalid fields.
3. Consumer app passes typed result to `initializeAppwrite({...})`.
4. `@repo/appwrite` stays runtime-focused and does not auto-initialize on first call.
