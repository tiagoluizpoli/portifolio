# Code Review — Zenith CMS Contact Save Fix
Date: 2026-04-15
Reviewer: Code Review Principal Engineer
Changed Files: 3 files, +58 / -5

## 0. Executive Summary
The contact save failure root cause is correctly addressed by adding required `iconCode` and `sort` fields for `contact_info` writes and by normalizing social icon payloads. Build health is strong (`pnpm guard` passes). However, test coverage for the new persistence behavior is missing and broad exception handling in the upsert path can still mask non-not-found failures.

## 1. Spec Alignment
[PASS] US4 Managed Platforms consumer sync: Contact flow accepts managed platform icon metadata and normalizes legacy shape.
[PASS] SC-003: `pnpm guard` passes with zero lint/type errors.
[PASS] Infrastructure alignment intent: write model now conforms to `contact_info` required attributes (`iconCode`, `sort`).

## 2. Deprecated Code Found
[🟡] apps/zenith/app/features/cms/context/cms-context.tsx:107 — `as any` serverFn casts remain (existing pattern; tolerated by lint suppression but weak type safety).
[🟡] packages/appwrite-core/src/infrastructure/repositories/contact.repository.ts:50 — `row as any` mapping remains in repository adapter layer.

## 3. Architecture Issues
[WARNING] Broad catch in upsert path (`updateRow` -> fallback `createRow`) catches every failure mode, not only not-found. This can hide schema/network/runtime errors and retry with misleading behavior.

## 4. Security Issues
[🟢] No auth, permission, or secret-handling regressions detected in changed files.

## 5. Performance Issues
[🟡] Social sync still performs full delete/recreate on every save, causing ID churn and extra writes. Acceptable for low volume but not scalable and complicates diff-based updates.

## 6. Code Quality
[INFO] Data normalization is now done at two layers (form submit and context save). This is resilient but duplicative; centralizing at one boundary (server or repository) would reduce drift risk.

## 7. Type Safety
[WARNING] Existing explicit `any` casts remain in changed files; no new unsafe casts were introduced by this patch, but strict policy is not fully met.

## 8. Test Coverage
Implemented:
- Repository-level tests proving `contact_info` writes include required `iconCode` and `sort`.
- Regression test for legacy social payload (`iconCode`) fallback to canonical persistence.
Coverage: Targeted repository tests were added in `packages/appwrite-core`.

## Action Items
### BLOCKING (must fix before merge)
- [x] Add targeted tests for `ContactRepository.updateByLocale` asserting `contact_info` writes include required schema attributes and social icon fallback behavior.

### HIGH (fix this sprint)
- [x] Narrow `catch` in upsert logic to only handle not-found row errors; rethrow all other failures.

### BACKLOG (track and schedule)
- [x] Replace broad `any` casts in contact repository boundary with typed row parsing guards.
- [x] Replace full delete/recreate social sync with diff-based upsert to reduce write amplification.
