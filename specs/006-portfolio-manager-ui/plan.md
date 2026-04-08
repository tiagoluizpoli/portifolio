# Implementation Plan: Portfolio Manager UI

**Branch**: `006-portfolio-manager-ui-fixed` | **Date**: 2026-04-06 | **Spec**: [specs/006-portfolio-manager-ui/spec.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/006-portfolio-manager-ui/spec.md)
**Input**: Simplified re-planning request to align with existing portfolio sections and remove complex naming.

## Summary
Implement the Portfolio Manager's **High-Fidelity UI** as a core section of the Zenith application. This phase focuses exclusively on the visual layout, interaction design (kinetic sorting), and editorial experience for managing the 7 portfolio chapters: Home, About, Experience, Education, Skills, Solutions, and Contact.

## Technical Context
- **Project Type**: Admin Dashboard Section (Zenith Route)
- **Design Inspiration**: **System Settings** (`settings.tsx`)
- **Performance Goals**: 60 FPS sorting / <300ms maturity audit
- **Visual Identity**: Oceanic Obsidian (No borders, tonal backgrounds #0b1326 / #171f33 / #2d3449).

## Constitution Check
- **GATE**: Standard naming only (Home, About, Experience, Education, Skills, Solutions, Contact — NO "Arsenal", "Brief", "Identity", "Delivery", "Access").
- **GATE**: No Role-Playing Terms (NO "Curator", "The Brief", "The Arsenal").
- **GATE**: Align with Migrator Seed Data structures (names/fields).
- **PR-XVIII**: Architecture-Level Test Plan included in spec.md.
- **PR-XX**: Security Boundary Mapping explicitly uses `server-functions`.

## Explicit SOLID Mapping (Principle XIX)

| Principle | Application | Rationale |
| :--- | :--- | :--- |
| **S**RP | Isolated CMS forms (`HomeForm`, etc.) | Isolating section-specific logic from the global `Sidebar` and `Layout` to minimize side effects and simplify testing. |
| **O**CP | Generic `SortableList.tsx` component | Built to handle any sortable entity type without modification, using dependency injection for item rendering. |
| **L**SP | Standard `BaseCmsRepository` interface | All 7 chapter repositories (Home, About, etc.) are interchangeable within the persistence layer. |
| **I**SP | Feature-specific types and hooks | The CMS feature exports only the interfaces it needs, avoiding "fat" shared object leakage. |
| **D**I | Repository injection into CMS Services | Decoupling the UI from the Appwrite-specific SDK to allow for easier mocking during Vitest execution. |

## Project Structure

### Documentation
```text
specs/006-portfolio-manager-ui/
├── spec.md              # Requirements
├── plan.md              # Updated Simplified Plan
├── research.md          # Alignment analysis
└── data-model.md        # Consolidated entity schemas
```

### Source Code
```text
apps/zenith/app/features/cms/
├── components/          # Rebuilding from scratch
│   ├── sections/        # HomeForm, AboutForm, ExperienceForm, etc.
│   ├── sidebar.tsx      # Vertical menu
│   ├── layout.tsx       # Main container
│   ├── status-footer.tsx # Bilingual maturity progress
│   └── common/          # IconPicker, SortableList, Uploader
├── hooks/
├── services/
└── types/

.stitch/designs/         # Authoritative visual baselines
├── home.png
├── about.png
├── experience.png
├── education.png
├── skills.png
├── solutions.png
└── contact.png
```

## Phase 1: High-Fidelity Design Orchestration (Stitch UI)

Following [Principle XVII](file:///home/tiago/01-dev-env/personal-repos/portifolio/.specify/memory/constitution.md) and the [UI Generation Workflow](file:///home/tiago/01-dev-env/personal-repos/portifolio/.specify/memory/guidelines/ui-generation-workflow.md), this phase implements the iterative design-first pipeline for ALL screens of the Portfolio Manager.

### Iterative Approval Loop
For EACH of the 7 sections (Home, About, Experience, Education, Skills, Solutions, Contact):
1. **Pollination**: Use `enhance-prompt` to polish requirements for that section.
2. **Generation**: Use `stitch-design` to create the editor interface.
3. **Review Gate**: Present the visual to the user. **NO CODE** until explicit approval.
4. **Documentation**: Call `design-md` to generate a dedicated `.stitch/designs/{section}.DESIGN.md`.

### Implementation Track
Once a section's design is approved:
- **Walkthrough**: Generate a `remotion` video demonstrating EN/PT switching and kinetic sorting.
- **Components**: Implement the `HomeForm.tsx`, etc., using `react:components`.

## Phase 2: Technical Implementation (Mocked Data Layer)

Rebuild the Portfolio Manager UI with a "UI-First" approach.
- **Section Sidebar**: Vertical "Editorial Navigation rail" matching the Settings sidebar layout.
- **Main Canvas**: `Card`-based workspace using `bg-surface-container-low/30` and borderless styling.
- **Editorial Identity**:
    - **Labels**: Uppercase, tracking-widest, `text-[10px]` bold.
    - **Inputs**: `bg-background/40`, `border-none`, `h-11`.
    - **Actions**: "Synchronize Changes" primary button in the header.
- **Section Forms**: Purpose-built forms for each section.
- **Status Footer**: Shows EN/PT maturity progress (0-100%).

## Verification Plan
### Automated Tests
- `npm run test:repositories`: Verify CRUD for all 7 sections in `appwrite-core`.

### Mandatory Design Gates
- **Stitch Approval**: Every form UI must be explicitly approved by the user via screenshot.
- **Remotion Fidelity**: A walkthrough video must verify interactive flows (sorting) before final completion.

### Manual Verification
- Verify the **sidebar** correctly toggles between the 7 simplified sections.
- Test **EN/PT toggle** in each form; ensure validation footer updates correctly.
- Test **Iconify** search and selection in Skills/Solutions.
- Confirm **reordering** works via drag handles in Experience/Education.
