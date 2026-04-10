# Test Plan - Zenith CMS Refinement

This is the mandatory Architecture-Level Test Plan for the Zenith CMS Refinement (008). Every functional requirement must have a corresponding validation scenario.

## 1. Backend & Domain Logic (Vitest)

### Global Skills Migration (FR-004)
- **TC-BE-001**: Verify that `SkillRepository.getByLocale` returns the same payload regardless of the locale input string.
- **TC-BE-002**: Verify that adding a skill updates the single global collection.

### Impact Metric Parity (FR-006)
- **TC-BE-003**: Verify that saving a new `ImpactMetric` record triggers a domain-service event that creates records with the same semantic `internalCode` (kebab-case) for all available locales in `SUPPORTED_LOCALES`.
- **TC-BE-004**: Verify that deleting an `ImpactMetric` by its `internalCode` triggers a cascading deletion for all records sharing that code.

---

## 2. Frontend Interaction (RTL / Vitest)

### Split-Screen Home (US3)
- **TC-FE-001**: Verify that the Home section renders the metadata form and the media preview side-by-side at resolutions > 1024px.
- **TC-FE-002**: Verify that updating the "Experience Start Date" field as a number correctly updates the local state.

### Metric Creation Dialog (US2)
- **TC-FE-003**: Verify that selecting "System Source" disables and hides the "Manual Value" input field.
- **TC-FE-004**: Verify that the form validation requires either a manual value OR a selected source field.

### Platform Management (FR-003)
- **TC-FE-005**: Verify that clicking the "Platform Management" side-drawer button opens the CRUD interface.

---

## 3. End-to-End Journeys (Playwright)

### Rebranding Verification (FR-001)
- **TC-E2E-001**: Verify that the Page Title and Sidebar Header display "Portfolio CMS".

### Metric Ghost-Row Sync (FR-006)
- **TC-E2E-002**:
    1. Log in to `/portfolio-cms/en/metrics`.
    2. Create a new metric: Label "Active Users" | Value "5000" | Code "active-users".
    3. Switch locale to `pt`.
    4. Verify that a record with Code "active-users" appears in the list as a "Ghost Row".

### Routing Prefix (FR-002)
- **TC-E2E-003**: Verify that navigating to old routes (e.g., `/portfolio/home`) results in a 404 or redirects to `/portfolio-cms/home`.

## Coverage Targets

| Domain | Target | Logic |
| :--- | :--- | :--- |
| **Domain Sync Services** | 95% | Critical for data integrity across locales. |
| **Shell/Routing** | 90% | Ensures consistent access to the CMS. |
| **UI Components** | 80% | Standardized CmsSaveButton and layout components. |
