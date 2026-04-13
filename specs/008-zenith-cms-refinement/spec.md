# Feature Specification: Zenith CMS Refinement

**Feature Branch**: `008-zenith-cms-refinement`  
**Created**: 2026-04-10  
**Status**: Approved (Refined)  
**Input**: Engineering Brief: Zenith CMS UI/UX Refinement & Infrastructure Alignment.

## 1. Context & Global Architecture
Transition from a generic "Portfolio" feel to a professional, hardened "Portfolio CMS". This requires synchronization between the `@repo/appwrite-core` domain models, the `apps/migrator` schema, and the `apps/zenith` UI.

### Global Constraints:
- **Naming Convention**: All UI references must use "Portfolio CMS".
- **Semantic Integrity**: Use direct, professional nomenclature.
- **Routing**: Prefix administrative sections with `portfolio-cms/`.
- **UI Standardization**: Unified `CmsSaveButton` component.

## 2. User Scenarios & Testing

### User Story 1 - Globalized Skill Management (Priority: P1)
As a Portfolio Curator, I want to manage my skills in a single, unified list that applies to all languages.
- **Migration Strategy**: Keep EN skills and discard all other locales during the infrastructure transition.
- **Acceptance Scenarios**:
  1. Compact grid layout: Icon (left), Name (below), Status/Type badges (Top-Left), Actions (Top-Right).
  2. Removal of "Mastery Percentage," "Workspace Filter," and "Stack Optimization" block.

### User Story 2 - Dynamic Impact Metrics Creation (Priority: P1)
As a Portfolio Curator, I want to create impact metrics using a dedicated dialog with "Manual" or "System Source" modes.
- **Field Logic**: If a system source is selected, hide the manual value input.
- **Safeguard**: When a metric is created in one locale, automatically generate ghost/placeholder rows for all other locales using a shared `internalCode` (UUID/Kebab-case).

### User Story 3 - Split-Layout Home Admin (Priority: P1)
As a Portfolio Curator, I want the Home section to be divided into a 1:1 split-screen layout.
- **Layout**: Left (Metadata Form), Right (High-fidelity uploader/viewer for Picture and CV).
- **High-Fidelity Criteria**: Support for drag-and-drop, upload progress bars, and borderless previews within a scrollable viewport.
- **Inputs**: Replace "Journey Origin" slider with a `number` input (disable spinners).

### User Story 4 - Managed Social Platforms (Priority: P2)
As a Portfolio Curator, I want to pick my social platforms from a predefined list managed in a separate drawer.
- **Platform Management**: Social platforms are managed entities manageable via a side-drawer/modal including `IconPicker`.

### User Story 5 - Solution Grid (Priority: P2)
As a Portfolio Curator, I want the Solutions list to be a card-based grid view with `IconPicker` integration.
- **Refinement**: Remove all external link/URL fields from the Solution entity, database, and UI.

## 3. Technical Requirements & Governance
- **Warnings as Errors**: No linting or type-safety warnings permissible.
- **Modular Components**: Decompose if > 300 lines (Composite Pattern).
- **Form Management**: Standardize on `TanStack Form` (v12+) with `zod-form-adapter`.
- **Performance**: Zero layout shift, `Motion` entrance animations.

## 4. Key Entities
- **Skill**: Global scope; `id`, `title`, `iconCode`, `type`, `status`, `sort`.
- **ImpactMetric**: Localized and linked by `internalCode`; `id`, `internalCode`, `label`, `value`, `locale`, `sourceId`, `aboutId`. Unique constraint on `(locale, internalCode)`.
- **Platform**: Managed entity; `id`, `name`, `iconCode`, `status`.

## 5. Success Criteria
- **SC-001**: 100% of skills are globalized (EN source-of-truth) with zero data loss for EN.
- **SC-002**: Home section features a perfect 50/50 split-layout with integrated asset previews.
- **SC-003**: `pnpm guard` passes with zero warnings.
- **SC-004**: All administrative routes respond under `/portfolio-cms/`.
