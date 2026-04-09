# Feature Specification: Wire Appwrite to Zenith CMS

**Feature Branch**: `007-wire-appwrite-cms`  
**Created**: 2026-04-09  
**Status**: Approved (Draft Finalized)  
**Input**: Integrated user decisions on Form Library (TanStack Form), Storage (Normalized), and Naming Alignment (UI to match DB for History).

## Clarifications

### Session 2026-04-09
- Q: How should the automated synchronization for MetricSource (e.g. GitHub) be initiated? → A: Manual (Triggered by a button in the CMS).
- Q: What is the maximum allowed file size for CV/Resume uploads? → A: 20MB.
- Q: How should validation errors behave regarding navigation? → A: Dirty State Warning (Show a dialog before allowing navigation away from unsaved changes).
- Q: What is the conflict resolution strategy for concurrent edits? → A: Last Save Wins.
- Q: What is the deletion behavior for Impact Metrics when an About record is cleared? → A: Cascading Remove.

### User Story 1 - Portfolio Manager Data Persistence (Priority: P1)

As a Portfolio Curator, I want my changes in the Zenith CMS to be saved to Appwrite so that my portfolio remains up-to-date across all platforms.

**Why this priority**: Core functionality- [x] **Principle XIII (TablesDB)**: All persistence uses `TablesDB` (including the new `metric_sources` collection) via the core package.

**Independent Test**: Modify a field in the "Home" section, click "Save", refresh the page, and verify the value is persisted.

**Acceptance Scenarios**:

1. **Given** I am on the Home section, **When** I change my name and save, **Then** the updated name should be stored in the Appwrite 'home' collection.
2. **Given** a network interruption, **When** I attempt to save, **Then** I should see a clear error message and my local changes should remain intact for retry.

---

### User Story 2 - Automated Schema Alignment (Priority: P1)

As a Developer, I want the database schema to automatically adapt to the UI requirements so that I don't have to manually manage Appwrite collections for every UI tweak.

**Why this priority**: Prevents technical debt and ensures the backend supports all UI features (like Impact Metrics).

**Independent Test**: Running the migrator should create all necessary tables and columns defined in the UI models.

**Acceptance Scenarios**:

1. **Given** a fresh Appwrite project, **When** I run the migrator, **Then** all 7 sections (including About and Impact Metrics) should have corresponding tables.
2. **Given** existing data, **When** the schema is updated, **Then** the migrator should handle column additions without data loss.

---

### User Story 3 - Robust Form Validation (Priority: P2)

As a Portfolio Curator, I want to be alerted if I enter invalid data so that I don't break the portfolio display or save corrupt information.

**Why this priority**: Ensures data integrity and improves UX.

**Independent Test**: Attempting to save a section with missing required fields or invalid formats should show validation errors and prevent the save operation.

**Acceptance Scenarios**:

1. **Given** an empty required field (e.g., Name), **When** I try to save, **Then** a validation error message should appear below the field.
2. **Given** an invalid URL in Socials, **When** I enter it, **Then** the system should immediately flag it as invalid.

---

### User Story 4 - Multi-Locale Management (Priority: P2)

As a Bilingual Curator, I want to manage my portfolio in both English and Portuguese so that I can reach a global audience.

**Why this priority**: Essential for the "Bilingual" requirement of the Zenith project.

**Independent Test**: Switch between 'EN' and 'PT' in the CMS, update data in one locale, and verify it doesn't affect the other (except for shared assets like Profile Picture).

**Acceptance Scenarios**:

1. **Given** I am editing the English "About" content, **When** I switch to Portuguese, **Then** I should see the Portuguese content for that section.
2. **Given** a shared asset like Profile Picture, **When** I update it in EN, **Then** it should also reflect in PT.

---

### Edge Cases

- **Large File Uploads**: System MUST support uploads up to **20MB** for CV/Resume files and MUST show a progress bar during the operation.
- **Concurrent Edits**: Standard "Last Save Wins" strategy. The most recent successful save operation overwrites previous data.
- **Session Expiry**: How does the form behave if the Appwrite session expires while editing? (Should prompt for re-login without losing form state if possible).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST sync all UI sections (Home, About, Experience, Education, Skills, Solutions, Contact) with Appwrite.
- **FR-002**: System MUST provide a centralized `CmsContext` or similar orchestration layer for data fetching and persistence.
- **FR-003**: System MUST implement Zod-based validation for all forms.
- **FR-004**: System MUST handle 1-to-N relationships with cascading removal logic for dependent items (e.g., About -> Impact Metrics).
- **FR-005**: All form inputs MUST be managed using **TanStack Form** for state management and validation.
- **FR-006**: The migrator script MUST be updated to support the full UI model, including a new `about` collection and a normalized `impact_metrics` collection.
- **FR-012**: The system MUST support a `metric_sources` collection and provide a manual "Sync" trigger in the UI to refresh metrics from external providers.
- **FR-007**: **Home Section Alignment**: UI will be split into `firstName`, `lastName`, and `namePresentation` to match DB. `profilePictureId` in UI maps to `pictureId` in DB. Add `downloadButtonText` and `journeyStartedIn` fields to the UI.
- **FR-008**: **History Alignment (Exp/Edu)**: Tables remain separate. UI types and screens MUST be adjusted to match existing Appwrite columns (`position`/`company`, `degree`/`institution`).
- **FR-009**: **Skills & Solutions Alignment**: Map UI `name`/`icon` to DB `title`/`iconCode`. Keep DB Skills `type` (frontend/backend/fullstack). Use Icons from Iconify. Add nullable `url` to Solutions.
- **FR-010**: **Standardized Lifecycle**: Use a consistent name (e.g., `active` or `status`) for all "enable/hide" toggles across UI and DB (Skills, Socials, etc.).
- **FR-011**: **Contact & Socials Alignment**: Keep row-based structure for `contact_info` and transform in UI. Keep `iconCode` for `socials`.

### Key Entities *(include if feature involves data)*

- **Home**: Split identity (`firstName`, `lastName`, `namePresentation`), bio, assets.
- **About**: Professional narrative + **Impact Metrics** (normalized).
- **Experience**: Career history (`position`, `company`, `duration`, `description`).
- **Education**: Academic history (`degree`, `institution`, `duration`, `description`).
- **Skill**: Competence tracking (`title`, `iconCode`, `type`, `status`).
- **Solution**: Service/Project offerings (`title`, `description`, `iconCode`, `url`).
- **Contact**: Row-based contact details (`type`, `value`, `iconCode`) and **SocialLinks**.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of fields in the 7 UI sections are correctly persisted to Appwrite.
- **SC-002**: Schema migrator runs in under 30 seconds for a full update.
- **SC-003**: All mandatory fields trigger validation errors within 200ms of an invalid submission attempt.
- **SC-004**: Switching between locales loads the correct data in under 500ms (cached).
- **SC-005**: Dirty state tracking prevents accidental data loss via a mandatory "Unsaved Changes" warning before section navigation.

## Technical Decisions

- **Form Library**: **TanStack Form** (Confirmed).
- **Validation**: Zod (with toggle-aware validation for Solutions URL).
- **History Mapping**: **Split UI props** to match specific DB columns.
- **Home Mapping**: **Split UI props** (`firstName`, `lastName`, `namePresentation`).
- **Contact Mapping**: **UI Transformation** logic to convert rows into a single form object.
- **Standardized Toggle**: Use consistent naming for lifecycle (`status` or `isActive`) across all entities.
