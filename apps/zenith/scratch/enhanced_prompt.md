# Engineering Brief: Zenith CMS UI/UX Refinement & Infrastructure Alignment

**SPECIALISTS ENGAGED**: `frontend-genius`, `appwrite` (v22.1.3), `tanstack-master`, `tailwind-expert`, `shadcn-ui`.

## 1. Context & Global Architecture
The goal is to transition from a generic "Portfolio" feel to a professional, hardened "Portfolio CMS". This requires total synchronization between the `@repo/appwrite-core` domain models, the `apps/migrator` schema management, and the `apps/zenith` administrative UI.

### Global Constraints:
- **Naming Convention**: All UI references must use "Portfolio CMS".
- **Semantic Integrity**: Use direct, professional nomenclature for all descriptions and labels. No "roleplay" or colloquial naming.
- **Routing**: Decouple frontend routes from folder structure. Use the prefix `portfolio-cms/[section]`.
- **UI Standardization**:
  - **Save Buttons**: Implement a unified `CmsSaveButton` component with consistent styling and text across all sections.
  - **Spacing**: Enforce a strict "Aesthetic Balance" rule: consistent paddings, compact layouts, and harmonious grid distributions.
- **Backend Sync**: All database schema changes must be reflected atomically across `appwrite-core` and `migrator`.

---

## 2. Section-Specific Requirements

### Home Section (Split Architecture)
- **Layout**: Implement a 1:1 split-screen layout.
  - **Left**: Form fields for metadata.
  - **Right**: High-fidelity uploader/viewer for Picture and CV assets.
- **Inputs**: Replace the "Journey Origin" slider with a clean `number` input. Disable browser-default increment/decrement controls (spinners).

### About & Impact Metrics (Dynamic Composition)
- **Composition**: Transition to a dialog-driven creation flow for metrics. The main list should be a read-only, high-density view.
- **Field Logic**:
  - Implement a Select field with two modes: **Manual** (text input) or **System Source** (dynamic list from database).
  - If a system source is selected, hide the manual value input.
- **Iconography**: Integrate the `IconPicker` component for all metric icons.
- **Backend Hardening**:
  - Implement an `internalCode` system to link metrics across languages.
  - **Safeguard**: When a metric is created in one locale, automatically generate ghost/placeholder rows for all other supported locales to ensure parity.
- **Visibility**: Ensure all input fields are highly legible and have clear focus/hover affordances.

### Skills (Grid Reversion & Global Data)
- **Layout**: Revert to the high-density card grid.
  - **Content**: Icon (left), Name (below), Status/Type badges (Top-Left), Actions (Top-Right).
  - **Aesthetic**: Compact, premium cards with calibrated spacing.
- **Data Scope**: Skills are now **Global**. Remove `locale` dependencies from the database, types, and UI. One list rules them all.
- **Cleanup**: Remove "Mastery Percentage," "Workspace Filter," and the "Stack Optimization" block.

### Solutions & Socials (Card-Driven Interaction)
- **Solutions**:
  - Consolidate to a card-based grid view.
  - Integrate `IconPicker`.
  - Disable external link fields (deprecated for this phase).
- **Contact/Socials**:
  - List View: Optimized card layout for social presence.
  - **Platform Management**: Social platforms are now a managed entity.
    - Implement a `PlatformSelect` populated from the database.
    - Platforms must be manageable via a side-drawer/modal, including `IconPicker` for branding.

---

## 3. Technical Requirements & Governance
- **Warnings as Errors**: No linting or type-safety warnings are permissible.
- **Modular Components**: If any component (e.g., `AboutForm.tsx`) exceeds 300 lines due to this refactor, it MUST be decomposed using the Composite Pattern (e.g., `MetricsList`, `MetricDialog`, `MetricField`).
- **Form Management**: Standardize on `TanStack Form` (v12+) with `zod-form-adapter`. Use the established §XVII bypass pattern only when recursion depth limits are hit.
- **Performance**: Ensure zero layout shift during dialog transitions. Use `Motion` for subtle, premium entrance animations.

## 4. Success Criteria
1. `pnpm guard` passes with zero warnings.
2. All routes are accessible via `/portfolio-cms/*`.
3. Database schemas are updated and tests in `migrator` and `appwrite-core` are synchronized.
4. UI provides a high-density, professional "CMS" feel as per the Oceanic Obsidian standards.
