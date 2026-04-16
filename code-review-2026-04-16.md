# Code Review — 009-appwrite-centralization
Date: 2026-04-16T00:00:00Z
Reviewer: Code Review Principal Engineer
Changed Files: 13 files, +498 / -0

## 0. Executive Summary
Current implementation is a solid start for Epic 1 scaffolding, but it is **not merge-ready**. The package violates core spec constraints: public SDK leakage, incomplete FR coverage for schema/services, and quality gate failures (`pnpm guard`, `pnpm typecheck`, `pnpm lint`).

Recommendation: **NO-GO** until blocking items in Spec Alignment and Type Safety are resolved.

## 1. Spec Alignment
[FAIL] FR-PKG-002: Package MUST NOT expose `node-appwrite` types/classes publicly.
- Violation: public API leaks SDK classes via gateway contract in [packages/appwrite/src/client.ts](packages/appwrite/src/client.ts#L9-L14) and exports them through [packages/appwrite/src/index.ts](packages/appwrite/src/index.ts#L1-L2).

[FAIL] FR-PKG-003: Schema Registry (Zod) not implemented.
- Missing `src/schemas/` registry and entity schemas.

[FAIL] FR-PKG-004: `Insert`/`Full`/`List` typed exports for each entity not implemented.

[PARTIAL] FR-PKG-005: `BaseRepository` exists in [packages/appwrite/src/repositories/base.ts](packages/appwrite/src/repositories/base.ts), but domain error mapping is absent.

[FAIL] FR-PKG-006: `MetricSyncService` and Serial-with-Rollback missing.

[FAIL] FR-PKG-007: `StorageService` missing.

[FAIL] FR-PKG-008: `AuthService` missing.

[PASS] FR-PKG-009: Internal latency/error logger implemented in [packages/appwrite/src/utils/logger.ts](packages/appwrite/src/utils/logger.ts).

[FAIL] FR-PKG-010: Verification utility missing.

## 2. Deprecated Code Found
No framework deprecations detected by scanner in `packages/appwrite/**`.

[🟡] [packages/appwrite/src/repositories/base.ts](packages/appwrite/src/repositories/base.ts#L48) — unsafe cast pattern (`as { code?: unknown }`) → typed error guard function (DEGRADED)
[🟡] [packages/appwrite/src/repositories/base.spec.ts](packages/appwrite/src/repositories/base.spec.ts#L37-L40) — double cast (`as unknown as`) in tests → typed mock adapter (DEGRADED)

## 3. Architecture Issues
[WARNING] Internal contract leakage: `IRepository` is exported in [packages/appwrite/src/repositories/interfaces.ts](packages/appwrite/src/repositories/interfaces.ts#L5), conflicting with plan/contracts requirement that it stay internal.

[INFO] `BaseRepository` separation is clean and under 300 lines, but public exports currently expose foundational internals too early in [packages/appwrite/src/index.ts](packages/appwrite/src/index.ts#L4-L10).

## 4. Security Issues
[🟠 HIGH] Missing input validation boundary before persistence operations.
- `create`/`update` accept arbitrary records in [packages/appwrite/src/repositories/base.ts](packages/appwrite/src/repositories/base.ts#L61-L97) without schema validation.

[🟡 MEDIUM] Environment safety gate missing.
- SC-PKG-004 requires crash-at-boot when required env is missing; not implemented.

## 5. Performance Issues
[WARNING] `findAll()` hardcodes `Query.limit(1000)` in [packages/appwrite/src/repositories/base.ts](packages/appwrite/src/repositories/base.ts#L57-L59) without cursor strategy; risks over-fetching and does not align with “Cursor-based Infinity” edge case.

## 6. Code Quality
[WARNING] Quality gate failing due formatting/import-order/type-only import issues in `packages/appwrite/**` from `pnpm lint`.

[WARNING] Static-only utility class flagged by Biome in [packages/appwrite/src/utils/mapper.ts](packages/appwrite/src/utils/mapper.ts#L15-L41) (`noStaticOnlyClass`).

[INFO] Good modular decomposition; no God class (>300 lines) detected.

## 7. Type Safety
[BLOCKING] Unsafe cast in parser in [packages/appwrite/src/repositories/base.ts](packages/appwrite/src/repositories/base.ts#L17-L19).

[BLOCKING] Typecheck fails (`TS2688`) because package dependencies/types are not installed yet in local workspace (`node_modules` missing for new package).

[WARNING] Tests rely on `as unknown as` coercion in [packages/appwrite/src/repositories/base.spec.ts](packages/appwrite/src/repositories/base.spec.ts#L37-L40).

## 8. Test Coverage
Missing:
- Schema registry/entity tests (Class 1-3)
- Repository auth/system-failure matrices (Class 4/5)
- Sync engine concurrency/rollback tests (Class 6/7)
- Catastrophic env/auth tests (Class 8)

Coverage estimate:
- Epic 1 foundational units only; far below feature-level mandatory scope from [specs/009-appwrite-centralization/test-plan.md](specs/009-appwrite-centralization/test-plan.md).

## Action Items
### BLOCKING (must fix before merge)
- [ ] Stop exporting SDK-facing types/classes from public surface; replace with package-owned abstractions.
- [ ] Implement missing FRs for current phase or keep package private-internal and clearly mark as incomplete WIP.
- [ ] Resolve lint/typecheck failures (`pnpm lint`, `pnpm typecheck`, `pnpm guard`).
- [ ] Remove unsafe casts in repository/runtime paths and add typed error guards.

### HIGH (fix this sprint)
- [ ] Add schema-first validation boundary for write operations.
- [ ] Keep `IRepository` internal; only export concrete repositories/services.
- [ ] Add cursor-based pagination strategy for list operations.

### BACKLOG (track and schedule)
- [ ] Add parity verification utility.
- [ ] Expand test matrix to full Class 1-8 coverage as specified.
