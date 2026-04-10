# Feature Specification: Zenith CMS Refinement

**Feature Branch**: `008-zenith-cms-refinement`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "Refactor Zenith CMS UI/UX and align infrastructure with global data scope for Skills, dynamic dynamic Impact Metrics, and platform management."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Globalized Skill Management (Priority: P1)

As a Portfolio Curator, I want to manage my skills in a single, unified list that applies to all languages, so that I don't have to duplicate icons and types for every translation.

**Why this priority**: Correcting the data scope of Skills is fundamental to the infrastructure hardening and reduces administrative overhead by 400% (per language removed).

**Independent Test**: Can be fully tested by creating a skill in any locale and verifying it appears in all other locale views without duplication.

**Acceptance Scenarios**:

1. **Given** I am in any locale of the CMS, **When** I view the Skills section, **Then** I see the same set of skill cards regardless of the current language.
2. **Given** I create a new skill with an icon and type, **When** I navigate to another language, **Then** the skill is identical and editable.
3. **Given** the new card layout, **When** I view the list, **Then** I see a compact grid with icons, names, and status/type badges on the top-left.

---

### User Story 2 - Dynamic Impact Metrics Creation (Priority: P1)

As a Portfolio Curator, I want to create impact metrics using a dedicated dialog that allows me to either enter a value manually or select a dynamic source from the database.

**Why this priority**: Replaces the inline list editing with a professional, controlled creation flow and enables advanced data-driven metrics (e.g., real-time GitHub stats).

**Independent Test**: Can be tested by opening the metric creation dialog and switching between "Manual" and "System Source" modes.

**Acceptance Scenarios**:

1. **Given** I open the Metric Creation dialog, **When** I select "Manual" mode, **Then** I see a text field to input the value.
2. **Given** I select "System Source", **When** I pick a source from the dropdown, **Then** the manual value field is hidden.
3. **Given** I save a new metric in English, **When** I switch to Portuguese, **Then** a "ghost row" (placeholder) for that metric exists in the list to remind me of the translation.

---

### User Story 3 - Split-Layout Home Admin (Priority: P2)

As a Portfolio Curator, I want the Home section to be divided into a form on the left and a media preview on the right, so that I can see my profile picture and CV while editing the metadata.

**Why this priority**: Improves the UX by providing immediate visual feedback for asset management without scrolling.

**Independent Test**: Can be verified by opening the Home section and checking if the layout is a 1:1 split at desktop sizes.

**Acceptance Scenarios**:

1. **Given** I am at a desktop resolution, **When** I open the Home section, **Then** the left half contains metadata fields and the right half contains the image and document previews.
2. **Given** the "Journey Started" field, **When** I want to edit it, **Then** I see a simple number input without auto-increment controls.

---

### User Story 4 - Managed Social Platforms (Priority: P2)

As a Portfolio Curator, I want to pick my social platforms from a predefined list managed in a separate drawer, so that icon branding and platform names stay consistent.

**Why this priority**: Centralizes platform branding (icons/colors) and prevents inconsistent user input for common social networks.

**Independent Test**: Can be tested by opening the social contact form and using the platform selection dropdown.

**Acceptance Scenarios**:

1. **Given** I am adding a social link, **When** I use the platform dropdown, **Then** I see the platforms defined in the "Platforms" database table.
2. **Given** I need to add a new platform (e.g., Threads), **When** I open the management side-drawer, **Then** I can create the platform and assign it an icon via the IconPicker.

## Edge Cases

- **Scale mismatch**: How does the split Home layout handle very long descriptions? (Requirement: Use scrollable areas or flexible grid layouts).
- **Orphan translations**: What happens if a "ghost row" metric is deleted in one language? (Requirement: System must prompt to delete the entire metric chain across all languages).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: **Zenith Branding**: All internal and external UI references must be changed from "Portfolio" to "Portfolio CMS".
- **FR-002**: **Routing Partition**: The frontend router must be updated to prefix all administrative CMS sections with `portfolio-cms/`.
- **FR-003**: **Unified Actions**: Create a `CmsSaveButton` component that enforces consistent styling, size, and branding across all sections.
- **FR-004**: **Global Skills**: The `Skill` database schema must be modified to remove the `locale` field, and the Zenith UI must fetch a single global collection.
- **FR-005**: **Impact Parity**: Implement an `internalCode` (UUID) in the `ImpactMetric` entity to link translations across locales.
- **FR-006**: **Metric Sync**: Implement a client-side or server-side safeguard that creates placeholder records for all locales when a new `internalCode` is initialized.
- **FR-007**: **Icon Picker**: All sections requiring icons (Skills, Metrics, Solutions, Platforms) must use the integrated `IconPicker` component.
- **FR-008**: **Solution Layout**: Solutions list must be converted to a card-based grid view (similar to updated Skills) to optimize screen real-estate.

### Key Entities

- **Skill**: Represents a professional competency. (Global scope; id, title, icon, type, status, sort).
- **ImpactMetric**: Represents a quantifiable achievement. (Localized but linked by `internalCode`; id, internalCode, label, value, sourceId, sourceKey, aboutId).
- **Platform**: Managed entity for social networks. (id, name, iconCode, status).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of skills are synchronized across all language views after the initial migration.
- **SC-002**: Users can complete a metric creation (including translation placeholders) in under 30 seconds.
- **SC-003**: `pnpm guard` passes with zero linting or type-safety warnings.
- **SC-004**: All administrative routes respond under `/portfolio-cms/` and maintain Ocean Obsidian aesthetic consistency.
