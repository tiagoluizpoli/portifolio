# Tasks: Portfolio Manager UI (Frontend Only)

## Feature Overview

Implement a high-fidelity **Portfolio Manager UI** within Zenith for curating the 7 portfolio chapters (**Home, About, Experience, Education, Skills, Solutions, Contact**) with mocked data logic. The design strictly follows the **System Settings** visual identity (editorial rail, no-border cards).

## Implementation Strategy

1. **Setup + UI Infrastructure**: Initialize directories and build common UI components (IconPicker, SortableList, etc.).
2. **The Shell**: Create the "Settings-style" sidebar and layout orchestrator.
3. **Section Interfaces**: Implement the 7 section forms using mocked state (Migrator Seed structure).
4. **Polish**: Finalize the "Oceanic Obsidian" design and typography.

---

## 🛠️ Phase 1: Setup

- [ ] T001 Initialize directory structure in `apps/zenith/app/features/portfolio-manager`
- [ ] T002 [P] Install dependencies: `@iconify/react @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` in `apps/zenith`

---

## 🏗️ Phase 2: UI Infrastructure (Common Components)

- [ ] T003 [P] Create `SortableList` wrapper using `dnd-kit` in `apps/zenith/app/features/portfolio-manager/components/common/sortable-list.tsx`
- [ ] T004 [P] Create `IconPicker` component using Iconify in `apps/zenith/app/features/portfolio-manager/components/common/icon-picker.tsx`
- [ ] T005 [P] Create `MockedMediaUploader` (UI-only) in `apps/zenith/app/features/portfolio-manager/components/common/media-uploader.tsx`
- [ ] T006 [P] Define `MockedPortfolioStore` with Migrator Seed structures in `apps/zenith/app/features/portfolio-manager/hooks/use-portfolio-mock.ts`

---

## 🧭 Phase 3: [US1] Navigation & Shell Layout

**Goal**: Implement the "Editorial Navigation rail" from System Settings.
**Independent Test Criteria**: User can navigate between sections; sidebar highlight matches `settings.tsx`.

- [ ] T007 [US1] Implement `SectionSidebar` using the `SettingsPage` navigation pattern in `apps/zenith/app/features/portfolio-manager/components/sidebar.tsx`
- [ ] T008 [US1] Implement `SectionLayout` with sticky header and (mocked) "Synchronize Changes" action in `apps/zenith/app/features/portfolio-manager/components/layout.tsx`

---

## 📊 Phase 4: Section-Specific Interfaces (Migrator Seed Structure)

**Goal**: Build the forms according to the visual design of System Settings and Migrator Seed fields.
**Independent Test Criteria**: Inputs use uppercase labels; borderless Card containers; EN/PT toggle works visually.

- [ ] T009 [US2] Implement `HomeForm` (UI Only): `name`, `title`, `description`, `pictureId`, `cvId`.
- [ ] T010 [US3] Implement `AboutForm`: `narrative`, `nationality`, `languages`.
- [ ] T011 [US4] Implement `ExperienceForm`: `company`, `role`, `duration`, `description`, `sort`.
- [ ] T012 [US4] Implement `EducationForm`: `institution`, `degree`, `duration`, `description`, `sort`.
- [ ] T013 [US5] Implement `SkillsForm`: `title`, `icon`, `category`, `sort`.
- [ ] T014 [US6] Implement `SolutionsForm`: `title`, `description`, `icon`, `sort`.
- [ ] T015 [US7] Implement `ContactForm`: `type`, `value`, `link`, `icon`, `sort`.

---

## 🔒 Phase 5: [US8] Maturity Lock (Visual State)

**Goal**: Add the Status Footer and visual lock mechanism.
**Independent Test Criteria**: Progress bar updates based on mocked form completion; "Live" toggle visual locking.

- [ ] T016 [US8] Implement `StatusFooter` progress bar in `apps/zenith/app/features/portfolio-manager/components/status-footer.tsx`
- [ ] T017 [US8] Implement the visual "Live" lock logic in the footer based on mocked maturity state

---

## ✨ Phase 6: Polish & Design Parity

- [ ] T018 Audit "Oceanic Obsidian" token compliance (no 1px borders) across all 7 sections
- [ ] T019 Sync typography with `settings.tsx` (Display font for titles; Inter for UI; Tracking-widest labels)
- [ ] T020 Final UI smoke test (Simulating navigation and reordering)

---

## 🗺️ Dependencies

- T003 - T005 (Infrastructure) → Lead to Section Forms
- T007 (Sidebar) → Prerequisite for Section Layout (T008)
- UI Development is fully decoupled from backend repos.

## 🏃 Parallel Execution Examples

- Dev A: Build Infrastructure (T003-T005)
- Dev B: Build Shell & Navigation (T007-T008)
- Once Shell is done:
    - Dev A: Section Forms (T009-T012)
    - Dev B: Section Forms (T013-T015)
