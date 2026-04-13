# Test Scenarios: Phase 5 — Impact Metrics (AD-001)

This document defines the exhaustive test suite for the **Source-Driven Metric Architecture** as per the `@test-master` mandate.

## 1. MetricSyncService & Parity Engine (Backend)

### Class 1: Happy Path
- **TS-BE-001**: Save metric `users-active` in `en` locale. Verify `isPlaceholder: true` ghost row is created in `pt` and `es` with matching `internalCode` and `sourceId`.
- **TS-BE-002**: Update `label` in `en`. Verify `pt` ghost row label remains localized (unsynced) while `internalCode` and `sourceId` remain locked.
- **TS-BE-003**: Delete metric by `internalCode`. Verify all localized rows (en, pt, es) are purged.

### Class 2: Edge Cases
- **TS-BE-004**: `internalCode` with max length (255 chars).
- **TS-BE-005**: Metric with `iconCode: null`. Verify it defaults to the `MetricSource` icon.
- **TS-BE-006**: Creation of a metric when only one locale is configured.

### Class 3: Invalid Input
- **TS-BE-007**: Attempt to create two metrics with the same `internalCode` in the same `locale`. Verify uniqueness constraint failure.
- **TS-BE-008**: Missing `sourceId`. Verify Zod validation rejection.

### Class 5: System Failures
- **TS-BE-009**: Database failure during ghost row propagation. Verify that the primary row is not committed or is rolled back (Atomicity).

---

## 2. useMetricNormalizer & UI Cockpit (Frontend)

### Class 1: Happy Path
- **TS-FE-001**: `useMetricNormalizer` returns `ImpactMetric.iconCode` if present.
- **TS-FE-002**: `useMetricNormalizer` returns `MetricSource.iconCode` if metric override is null.
- **TS-FE-003**: `MetricDialog` locks the `value` input when an **Automated** source is selected.
- **TS-FE-004**: `MetricDialog` enables the `value` input when **Manual** source is selected.

### Class 2: Edge Cases
- **TS-FE-005**: Metric source has no icon. Verify fallback to a default "database" icon.
- **TS-FE-006**: Long metric labels overlapping the UI grid cards.

### Class 3: Invalid Input
- **TS-FE-007**: Submitting "Automated" metric with a manual value injected. Verify client-side rejection.

### Class 7: State Transition Failures
- **TS-FE-008**: User enters a value in "Manual" mode, then switches to "Automated". Verify the value is cleared or ignored upon submission.
- **TS-FE-009**: Dialog closed mid-loading. Verify no state leak or background sync artifacts.

---

## 3. End-to-End (Playwright)

### Class 6: Concurrent Operations
- **TS-E2E-001**: Rapidly save a new metric. Verify no duplicate ghost rows created in parallel locales.
- **TS-E2E-002**: "Double-Click" on Delete parity line. Verify single clean purge without 404 flash.
