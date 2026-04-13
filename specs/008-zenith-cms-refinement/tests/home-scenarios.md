# Test Scenarios: Phase 6 — Home Split-Layout (US3)

This document defines the exhaustive test suite for the Home Admin restoration as per the `@test-master` mandate.

## 1. Split-Layout & UI Precision (Frontend)

### Class 1: Happy Path
- **TS-FE-001**: Restore `lg:grid-cols-2` 1:1 split at viewport > 1024px. Verify metadata form on left, asset preview on right.
- **TS-FE-002**: Asset Preview displays "Picture" and "CV" side-by-side or in high-fidelity stacked view with clean borders.
- **TS-FE-003**: Number input for "Journey Started" renders without native browser spinners (up/down arrows).

### Class 2: Edge Cases
- **TS-FE-004**: Small viewports (< 1024px) collapse the 1:1 grid into a single column (Metadata first, Assets second).
- **TS-FE-005**: Asset Preview with missing files. Verify graceful "No Asset Uploaded" placeholder state.

### Class 3: Invalid Input
- **TS-FE-006**: Inputting non-numeric values into "Journey Started". Verify Zod validation rejection or native input prevention.
- **TS-FE-007**: Entering a future year for "Journey Started" (if logic prevents this).

### Class 7: State Transition Failures
- **TS-FE-008**: Switching tabs while an asset is loading. Verify no "Preview Leak" or interrupted state corruption.

## 2. Asset Integrity & Preview (Integrity)

### Class 1: Happy Path
- **TS-INT-001**: PDF CV preview renders within a scrollable container in the right column.
- **TS-INT-002**: Image Picture preview renders with `aspect-square` or original aspect ratio preservation.

### Class 3: Invalid Input
- **TS-INT-003**: Uploading a file type not supported by the previewer (e.g., .zip). Verify error message instead of broken frame.
