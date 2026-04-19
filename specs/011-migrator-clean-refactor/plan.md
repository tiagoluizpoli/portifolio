# Implementation Plan: Refactor appwrite-migrator to Clean Architecture

**Branch**: `011-migrator-clean-refactor` | **Date**: 2026-04-18 | **Spec**: [spec.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/011-migrator-clean-refactor/spec.md)

## Summary

The objective is to refactor the `appwrite-migrator` application to adhere to Clean Architecture, SOLID principles, and encapsulate any infrastructure leakages. The primary goal is reducing the cognitive load created by a monolithic entry point and complex services by segregating concerns into domain-specific service classes, enforcing strict monorepo import practices, and purging SDK builders (like `Query`) from the high-level services.

---

## Technical Context

**Language/Version**: Node.js 24 (LTS), TypeScript  
**Primary Dependencies**: `@repo/appwrite`, `@repo/config`, `commander`, `zod`
**Testing**: Vitest (Unit tests co-located in `src/`, E2E tests in `tests/e2e/`)

## Constitution Check

- **VIII. Clean Code & SOLID**: Adherence is the primary goal. The monolithic script is decomposed into SRP classes < 300 lines.
- **XV. Infrastructure Invisibility**: Centralizing data operations into Repository abstractions and strictly isolating SDK builders.
- **XVIII. Mandatory Test-First Architecture**: Handled via `test-plan.md`.

---

## Project Structure (Revisited)

### Source Code (`apps/appwrite-migrator/src/`)

```text
├── cli/
│   ├── MigratorCli.ts       # CLI orchestration
│   └── cli-config.ts        # [NEW] Zod configuration schema
├── core/
│   ├── BaseService.ts       # Shared base abstractions
│   └── types.ts             # Domain models (Delta, Plan, Brands)
├── services/
│   ├── seeder/              # Decomposed Seeder Lifecycle
│   │   ├── SeederValidator.ts
│   │   ├── SeederPlanner.ts
│   │   ├── SeederExecutor.ts
│   │   └── TemplateGenerator.ts
│   ├── check/
│   │   ├── CheckService.ts
│   │   └── SchemaComparator.ts
│   ├── migrate/
│   │   └── MigrateService.ts
│   └── template/
│       └── TemplateService.ts
└── index.ts                 # Bootstrap (< 80 lines)
```

## Hardened Architecture Strategy (Phases 6-9)

### 1. Seeder Decomposition (SRP)
- Instead of an 811-line `seeder.ts`, we implement a lifecycle stage approach. Each stage is an independent service with its own unit tests.

### 2. Type Safety & Domain Integrity
- **Branded Types**: Implementation of branded strings for `TableId`, `BucketId`, and `FileId` in the `@repo/appwrite-core` layer.
- **Purge Unsafe Casts**: System-wide cleanup of `as any` and `as unknown` patterns.

### 3. CLI Logic Gating
- Migration from manual parsing to a **Commander + Zod** hybrid. `Commander` handles the shell routing, while `Zod` provides the "Definition of Ready" for all configuration inputs.

---

## Verification Plan

### Automated Tests
- 100% coverage target for all newly created classes.
- `pnpm guard` mandatory at every stage.

### Manual Verification
- Execute `pnpm migrator` in various modes to verify the new orchestration and configuration validation.
