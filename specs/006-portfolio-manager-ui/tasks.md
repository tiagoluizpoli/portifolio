# Tasks: Portfolio Manager UI

**Input**: Design documents from `specs/006-portfolio-manager-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story, following the iterative Design-First workflow.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and design-first infrastructure.

- [ ] T001 Initialize `.stitch/designs/` directory for visual authoritative baselines
- [ ] T002 [P] Verify `ui-generation-workflow.md` access and constitution alignment
- [ ] T003 [P] Configure Zenith route for `/features/cms/portfolio`

---

### Phase 2: Foundational (Orchestration & Common UI)

**Purpose**: Core infrastructure and shared components that MUST be complete before user story implementation.

- [ ] T004 Implement `apps/zenith/app/features/cms/layout.tsx` Main Container
- [ ] T005 [P] Implement `apps/zenith/app/features/cms/components/sidebar.tsx` Navigation Rail
- [ ] T006 [P] Implement `apps/zenith/app/features/cms/components/status-footer.tsx` Maturity Progress
- [ ] T007 [P] Implement `apps/zenith/app/features/cms/components/common/IconPicker.tsx` (Iconify integration)
- [ ] T008 [P] Implement `apps/zenith/app/features/cms/components/common/SortableList.tsx` (dnd-kit wrapper)
- [ ] T008-2 [P] Implement Vitest unit tests for `BaseCmsRepository` reordering logic (TDD)

**Checkpoint**: Foundation ready - iterative design orchestration can now begin per story.

---

## Phase 3: User Story 1 - Home Section (Priority: P1) 🎯 MVP

**Goal**: Manage Home hero metadata, profile info, and bilingual assets.

**Independent Test**: Verify Home form renders, maps to `Home` entity, and allows picture/CV upload.

### Step 1: High-Fidelity Design Orchestration (US1)
- [ ] T009 [US1] Enhance Home prompt and generate Stitch design in `.stitch/designs/home.png`
- [ ] T010 [US1] Present Home design to user for explicit approval gate
- [ ] T011 [US1] Generate dedicated `.stitch/designs/home.DESIGN.md` using `design-md`
- [ ] T012 [US1] Generate Remotion walkthrough for Home interactions in `video/walkthroughs/home.mp4`

### Step 2: Implementation (US1)
- [ ] T012-2 [US1] Write Playwright BDD test for Home Editor basic rendering and field validation
- [ ] T013 [P] [US1] Create Home model/types in `apps/zenith/app/features/cms/types/home.ts`
- [ ] T014 [US1] Implement `apps/zenith/app/features/cms/components/sections/HomeForm.tsx` (based on approved design)
- [ ] T015 [US1] Integrate with `HomeRepository` in `appwrite-core`

---

## Phase 4: User Story 2 - About Section (Priority: P2)

**Goal**: Manage personal narrative and bilingual stats.

**Independent Test**: Verify About form renders and saves narrative/nationality/languages.

### Step 1: High-Fidelity Design Orchestration (US2)
- [ ] T016 [US2] Enhance About prompt and generate Stitch design in `.stitch/designs/about.png`
- [ ] T017 [US2] Present About design to user for explicit approval gate
- [ ] T018 [US2] Generate dedicated `.stitch/designs/about.DESIGN.md`
- [ ] T019 [US2] Generate Remotion walkthrough for About section

### Step 2: Implementation (US2)
- [ ] T020 [P] [US2] Create About model/types in `apps/zenith/app/features/cms/types/about.ts`
- [ ] T021 [US2] Implement `apps/zenith/app/features/cms/components/sections/AboutForm.tsx`
- [ ] T022 [US2] Integrate with `AboutRepository` in `appwrite-core`

---

## Phase 5: User Story 3 - Kinetic Reordering (Experience & Education) (Priority: P2)

**Goal**: Manage professional and academic history with smooth drag-and-drop sorting.

**Independent Test**: Verify items can be reordered at 60 FPS and `sort` field updates.

### Step 1: High-Fidelity Design Orchestration (US3)
- [ ] T023 [US3] Enhance Experience/Education prompts and generate designs
- [ ] T024 [US3] Present designs to user for explicit approval gate
- [ ] T025 [US3] Generate dedicated `.stitch/designs/experience.DESIGN.md` and `education.DESIGN.md`
- [ ] T026 [US3] Generate Remotion walkthrough focusing on Kinetic Sorting (60 FPS)

### Step 2: Implementation (US3)
- [ ] T026-2 [US3] Write Playwright BDD test for Kinetic Sorting (Grab, Drag, Drop, Visual Scale)
- [ ] T027 [P] [US3] Create History model/types in `apps/zenith/app/features/cms/types/history.ts`
- [ ] T028 [US3] Implement `apps/zenith/app/features/cms/components/sections/ExperienceForm.tsx` with DND
- [ ] T029 [US3] Implement `apps/zenith/app/features/cms/components/sections/EducationForm.tsx` with DND
- [ ] T030 [US3] Implement `ExperienceRepository` and `EducationRepository` in `appwrite-core`

---

## Phase 6: User Story 4 - Managed Assets (Skills & Solutions) (Priority: P3)

**Goal**: Manage skill categories and service offerings with integrated icon curation.

**Independent Test**: Verify `IconPicker` maps correct Iconify IDs and categories save correctly.

### Step 1: High-Fidelity Design Orchestration (US4)
- [ ] T031 [US4] Enhance Skills/Solutions prompts and generate designs
- [ ] T032 [US4] Present designs to user for explicit approval gate
- [ ] T033 [US4] Generate dedicated `.stitch/designs/skills.DESIGN.md` and `solutions.DESIGN.md`
- [ ] T034 [US4] Generate Remotion walkthrough focusing on Icon Selection

### Step 2: Implementation (US4)
- [ ] T034-2 [US4] Write Playwright BDD test for IconPicker search and brand mapping
- [ ] T035 [P] [US4] Create Skills/Solutions types in `apps/zenith/app/features/cms/types/managed-assets.ts`
- [ ] T036 [US4] Implement `apps/zenith/app/features/cms/components/sections/SkillsForm.tsx`
- [ ] T037 [US4] Implement `apps/zenith/app/features/cms/components/sections/SolutionsForm.tsx`
- [ ] T038 [US4] Implement `SkillsRepository` and `SolutionsRepository` in `appwrite-core`

---

## Phase 7: User Story 5 - Socials & Contact (Priority: P3)

**Goal**: Manage secondary contact channels and social links.

**Independent Test**: Verify Contact form renders and maps type/value/link.

### Step 1: High-Fidelity Design Orchestration (US5)
- [ ] T039 [US5] Enhance Contact prompts and generate designs
- [ ] T040 [US5] Present designs to user for explicit approval gate
- [ ] T041 [US5] Generate dedicated `.stitch/designs/contact.DESIGN.md`

### Step 2: Implementation (US5)
- [ ] T042 [P] [US5] Implement `apps/zenith/app/features/cms/components/sections/ContactForm.tsx`
- [ ] T043 [US5] Implement `ContactRepository` in `appwrite-core`

---

## Phase 8: Polish & Security

**Purpose**: Bilingual maturity lock and final visual refinement.

- [ ] T043-2 Implement Vitest unit tests for `MaturityAuditService` calculation logic (TDD)
- [ ] T043-3 Write Playwright BDD test for "Maturity Lock" (Publish disabled while fragments missing)
- [ ] T044 Implement EN/PT bilingual maturity lock logic in `apps/zenith/app/features/cms/hooks/useMaturityAudit.ts`
- [ ] T045 Final visual polish (glassmorphism overlays, tonal background refinements)
- [ ] T046 Run full maturity audit: ensure Published status works as intended.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundation (Phase 1-2)**: MUST be complete before starting any US implementation.
- **Iterative Orchestration**: MUST occur per story before IMPLEMENTATION of that story.
- **US1 (Home)**: Priority 1 (MVP). Can be implemented while US2 design is being refined.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### Parallel Opportunities

- Once Phase 2 is complete, US1 and US2 implementation can technically run in parallel if designs are approved.
- Repositories in `appwrite-core` can be implemented in parallel with UI components.

---

## Task Statistics
- **Total tasks**: 53
- **Tasks per story**: 8 (average)
- **Parallel opportunities**: 12
- **MVP Scope**: Phases 1, 2, and 3 (Home Section).
).
