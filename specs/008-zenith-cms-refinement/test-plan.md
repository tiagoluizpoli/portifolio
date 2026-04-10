# Test Plan - Zenith CMS Refinement

This is the mandatory Architecture-Level Test Plan for the Zenith CMS Refinement (008). Every functional requirement must have a corresponding validation scenario.

## 1. Backend & Domain Logic (Vitest)

### Global Skills Migration (FR-004)
- **TC-BE-001**: Verify that `SkillRepository.getByLocale` (or the new global fetch) returns ONLY skills originally from the 'en' locale.
- **TC-BE-002**: Verify that deleting a skill updates the single global collection across all administrative views.
- **TC-BE-005**: Verify that the migration script correctly deletes all non-EN skills while preserving EN skills without data loss.

### Impact Metric Parity (FR-006)
- **TC-BE-003**: Verify that saving a new `ImpactMetric` record triggers a domain-service event that creates "Ghost Row" records with the same semantic `internalCode`.
- **TC-BE-004**: Verify that deleting an `ImpactMetric` by its `internalCode` triggers a cascading deletion for all records sharing that code.

---

## 2. Frontend Interaction (RTL / Vitest)

### Split-Screen Home (US3)
- **TC-FE-001**: Verify that the Home section renders in a perfect 1:1 split-layout at resolutions > 1024px.
- **TC-FE-007**: Verify that the right column displays a Picture uploader/viewer and a CV uploader/viewer side-by-side or stacked correctly.
- **TC-FE-009**: Verify "Journey Started" number input does NOT show browser increment/decrement spinners.

### Metric Creation Dialog (US2)
- **TC-FE-003**: Verify that selecting "System Source" disables and hides the "Manual Value" input field.
- **TC-FE-004**: Verify that form validation requires exactly one of [Manual Value, System Source] to be provided.

### Platform & Solution Management (FR-003, FR-008)
- **TC-FE-005**: Verify that the Platform management side-drawer enables creating new platforms with `IconPicker`.
- **TC-FE-006**: Verify that the Solutions list renders as a card-based grid with icons and titles.
- **TC-FE-008**: Verify `IconPicker` correctly updates the `iconCode` field in Skills, Metrics, and Solutions.

---

## 3. End-to-End Journeys (Playwright)

### Rebranding & Routing
- **TC-E2E-001**: Verify "Portfolio CMS" branding appears in Page Title, Sidebar Header, and persistent Save buttons.
- **TC-E2E-003**: Verify all administrative sections are prefixed with `/portfolio-cms/` and old routes redirect or 404.

### Globalized Skill Lifecycle
- **TC-E2E-004**: Create a skill in `en`, switch to `pt`, and verify the skill exists and is identical.

### Metric Parity Journey
- **TC-E2E-002**: Create a metric with internal code "active-users" in `en`, verify "Ghost Row" appears in `pt` metric list.

## 4. Quality Gate Targets
- **Linting**: Zero `biome` warnings.
- **Types**: Zero `tsc` errors.
- **Coverage**: 100% functionality coverage for Round-based deliverables.
