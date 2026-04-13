# Test Scenarios: Phase 7 — Managed Platforms (US4)

This document defines the exhaustive test suite for the Managed Platforms drawer as per the `@test-master` mandate.

## 1. Platform CRUD & Drawer Lifecycle (Frontend)

### Class 1: Happy Path
- **TS-FE-001**: Open Platform Drawer. Verify list of existing platforms (e.g., GitHub, LinkedIn) fetches from backend.
- **TS-FE-002**: Add new Platform with name "X" and `IconPicker` selection. Verify it appears in the list immediately.
- **TS-FE-003**: Toggle `status` (Active/Inactive) from the drawer. Verify it reflects in the Contact Form consumer.

### Class 2: Edge Cases
- **TS-FE-004**: Adding a platform with a name that already exists. Verify graceful handling (e.g., allow duplicates if domain allows, or show error).
- **TS-FE-005**: Very long platform names. Verify no layout break in the drawer list.

### Class 3: Invalid Input
- **TS-FE-006**: Submitting an empty platform name. Verify Zod validation rejection.
- **TS-FE-007**: Closing the drawer mid-save. Verify no state corruption.

## 2. Platform Consumer Sync (Interaction)

### Class 1: Happy Path
- **TS-INT-001**: Update a platform icon in the drawer. Verify the Contact form in the main admin view updates its icon display without full page reload.
- **TS-INT-002**: Deactivate a platform in the drawer. Verify it is hidden from the "Active Social Platforms" list in the Contact form.

### Class 5: System Failures
- **TS-INT-003**: Backend failure during platform deletion. Verify "Delete Failed" notification and that the item remains in the UI.
