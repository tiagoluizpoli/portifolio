# Implementation Plan: Appwrite Central Logic Package (@repo/appwrite)

**Branch**: `009-appwrite-centralization` | **Date**: 2026-04-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-appwrite-centralization/spec.md`

## Summary
Implement a high-fidelity, clean-room Appwrite package (`@repo/appwrite`) that centralizes interaction logic for **11 core entities**. The architecture follows a **three-layer repository pattern**: an internal `IRepository` contract, a concrete (overridable) `BaseRepository` abstract class, and exported domain-specific repositories. Utilizes a **Mapper Pattern** for strict property normalization ($id -> id) and enforces 100% test coverage.

## Technical Context

**Language/Version**: TypeScript 5.4+  
**Primary Dependencies**: `node-appwrite` v3+, `zod`, `vitest`  
**Storage**: Appwrite (Database, Buckets, Auth)  
**Testing**: Vitest (100% Coverage Thresholds)  
**Target Platform**: Node.js (Server-side)
**Project Type**: Library (pnpm workspace package)  
**Performance Goals**: Latency-monitored repository calls (FR-PKG-009)  
**Constraints**: Zero-SDK leakage, named exports only, <300 line components.  
**Scale/Scope**: Unified gateway for Zenith CMS, Migrator CLI, and future portfolio apps.

## Constitution Check

| Gate | Status | Detail |
|:---|:---|:---|
| **Named Exports** | PASS | All package entry points use strictly named exports. |
| **Type Safety** | PASS | Zero `any` usage; Zod source-of-truth for all models. |
| **300-Line Limit** | PASS | Repositories and Services decompose into small, focused modules. |
| **Grid Protocol** | N/A | Logic-only package. |
| **Spring Motion** | N/A | Logic-only package. |

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
└── tests/
    ├── schemas/         # Transformation parity tests
    ├── services/        # Mocked behavioral tests
    └── repositories/    # SDK integration mocks (100% coverage)
```

**Structure Decision**: Clean-room `pnpm` package in `packages/appwrite`. This avoids legacy pollution from `appwrite-core` while providing a fresh foundation for standard naming and 100% test coverage.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Mapper Pattern | $id -> id normalization | Decouples Zod validation from transformation logic. |
| Three-Layer Repos | Encapsulation | Keeps the base `IRepository` internal while exposing overridable `BaseRepository` logic via exported concrete classes. |
| Inheritance | BaseRepository | Composition-only requires too much boilerplate for standard CRUD across 11 collections. |
