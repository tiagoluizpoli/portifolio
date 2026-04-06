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
```

## Proposed Changes

### [Frontend] Zenith Hub
Rebuild the Portfolio Manager UI with a "UI-First" approach (Mocked Data Layer).
- **Section Sidebar**: Vertical "Editorial Navigation rail" matching the Settings sidebar layout.
- **Main Canvas**: `Card`-based workspace using `bg-surface-container-low/30` and borderless styling.
- **Editorial Identity**:
    - **Labels**: Uppercase, tracking-widest, `text-[10px]` bold.
    - **Inputs**: `bg-background/40`, `border-none`, `h-11`.
    - **Actions**: "Synchronize Changes" primary button in the header.
- **Section Forms**: Purpose-built forms for each section:
    - **Home**: `name`, `title`, `description`, `pictureId`, `cvId`.
    - **About**: `narrative`, `nationality`, `languages`.
    - **Experience/Education**: `company`/`institution`, `role`/`degree`, `duration`, `description`, `sort`.
    - **Skills**: `title`, `icon`, `category`, `sort`.
    - **Solutions**: `title`, `description`, `icon`, `sort`.
    - **Socials/Contact**: `type`, `value`, `link`, `icon`, `sort`.
- **Status Footer**: Shows EN/PT maturity progress (0-100%).

## Verification Plan
### Automated Tests
- `npm run test:repositories`: Verify CRUD for all 7 sections in `appwrite-core`.

### Manual Verification
- Verify the **sidebar** correctly toggles between the 7 simplified sections.
- Test **EN/PT toggle** in each form; ensure validation footer updates correctly.
- Test **Iconify** search and selection in Skills/Solutions.
- Confirm **reordering** works via drag handles in Experience/Education.
