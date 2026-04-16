# Test Plan: @repo/appwrite

This plan ensures a zero-regression, 100% coverage implementation for the centralized Appwrite package.

## Coverage Mandate
- **Lines**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Statements**: 100%
- **Enforcement**: `vitest --coverage` with threshold failure in pre-commit/CI.

## Test Scenarios (Master Class 1-8)

### Class 1: Happy Path (Works as Designed)
- **Standard CRUD**: `repo.findById` and `repo.findAll` return normalized entities ($id ➔ id).
- **Metric Sync**: Creating an EN metric successfully creates a PT ghost row.
- **Storage**: Small file upload returns correct metadata.

### Class 2: Edge Cases (Boundary Conditions)
- **Max Length Strings**: Test title/description fields at Appwrite's max attribute limits.
- **Empty Collections**: Verify `findAll` returns `[]` (not error) when zero documents exist.
- **Malformed IDs**: Verify `findById` returns `null` for non-existent or invalid string IDs.

### Class 3: Invalid Input (User Error)
- **Schema Rejection**: Zod validation fails for missing required fields (e.g., missing `internalCode`).
- **Data Type Mismatch**: Attempting to save a string in a boolean field (e.g., `isPlaceholder`).
- **Mapper Scrubbing**: Verify `DocumentMapper.toAppwrite` correctly ignores extra fields provided by consumers.
- **Env Group Rejection**: `getEnv({...})` rejects unknown/invalid flag requests at type/runtime boundaries.

### Class 4: Permission Failures (Authorization)
- **AuthService**: Verify 401 response when session is expired.
- **Resource Lock**: Verify rejection when updating a document without write permissions.

### Class 5: System Failures (Infrastructure)
- **Appwrite 500**: Mock SDK throwing general failure; verify Repository throws `AppwriteSystemException`.
- **Timeout (408)**: Simulate slow network; verify logic handles request abortion.
- **Rate Limit (429)**: Verify retry/failure logic when SDK is rate-limited.

### Class 6: Concurrent Operations (Race Conditions)
- **Double Sync**: Simulate two rapid `MetricSyncService.sync` calls; verify zero duplicate ghost rows created (idempotency).
- **Update Conflict**: Verify behavior when a document is updated by two processes simultaneously.

### Class 7: State Transition Failures
- **Partial Sync Crash**: Simulate PT creation failure during EN sync; verify **Compensating Transaction** deletes the EN source to maintain parity.
- **Orphan Cleanup**: Test `cleanup()` logic when a source is deleted before sync completes.

### Class 8: Catastrophic Failures (Full System)
- **Missing ENV**: Package crash-at-boot if `APPWRITE_PROJECT_ID` is null.
- **Network Offline**: Verify package provides clear "No Connection" error instead of hanging.
- **Grouped Fail Fast**: If one variable is missing inside a requested env group, helper returns no partial output and throws a descriptive catastrophic config error.

## FR/US Test Mapping

| Requirement | Test Focus                                             | Expected Outcome                                             |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| FR-PKG-006  | `MetricSyncService` rollback tests                     | Partial sync creation triggers compensating delete           |
| FR-PKG-008  | `AuthService` lifecycle tests                          | Session create/get/delete and error mapping validated        |
| FR-PKG-011  | `@repo/config` group schema tests                      | Group values validated by Zod and typed                      |
| FR-PKG-012  | `getEnv({...})` inference tests                        | Returned object keys/types match requested `true` flags only |
| FR-PKG-013  | Integration tests (`@repo/config` -> `@repo/appwrite`) | Appwrite initializes only with typed validated config        |
| FR-PKG-014  | Initialization behavior tests                          | No implicit auto-init; explicit initialization required      |

## Additional Guardrails (Env Centralization)
- Shared env package API remains minimal: one public helper + type exports.
- All consuming apps avoid direct ad-hoc Appwrite env parsing once migrated.
- Compile-time key safety enforced for requested env group names.

## Coverage Mandate & Guardrails
- **Threshold**: 100% (Lines, Branches, Functions, Statements).
- **Enforcement**: Vitest coverage-gate in CI.
- **SDK Isolation**: Full mocking of `node-appwrite` via `vitest-mock-extended`.
