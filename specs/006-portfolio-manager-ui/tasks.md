# Tasks: Portfolio Manager UI

**Input**: Design documents from `specs/006-portfolio-manager-ui/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story, following the iterative Design-First workflow with Stitch.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and design-first infrastructure.

- [ ] T001 Initialize `.stitch/designs/` directory for visual authoritative baselines
- [ ] T002 Configure Zenith navigation routes for `/features/cms/*` (Portfolio Chapters)
- [ ] T003 [P] Configure Zenith boilerplate layouts for the CMS feature area

---

## Phase 2: Foundational (Orchestration & Common UI)

**Purpose**: Core infrastructure and shared components required for all sections.

- [ ] T004 Implement `apps/zenith/app/features/cms/layout.tsx` Main Container (Glassmorphism shell)
- [ ] T005 [P] Implement `apps/zenith/app/features/cms/components/sidebar.tsx` Navigation Rail
- [ ] T006 [P] Implement `apps/zenith/app/features/cms/components/status-footer.tsx` Maturity Progress indictator
- [ ] T007 [P] Implement `apps/zenith/app/features/cms/components/common/IconPicker.tsx` (Iconify + Manual fallback)
- [ ] T008 [P] Implement `apps/zenith/app/features/cms/components/common/SortableList.tsx` (dnd-kit wrapper)
- [ ] T009 Implement `MaturityAuditService.ts` client-side calculation logic (Vitest TDD)

**Checkpoint**: Foundation ready - iterative design orchestration can now begin per story.

---

## Phase 3: User Story 1 - Home Section (Priority: P1) 🎯 MVP

**Goal**: Manage Home hero metadata, profile info, and bilingual assets (Picture/CV).

**Independent Test**: Verify Home form renders, maps to `Home` entity fields (`pictureId`, `cvId`), and validation footer updates.

### Design Orchestration (US1)
- [ ] T010 [US1] Enhance Home prompt and generate Stitch design baseline
- [ ] T011 [US1] Present Home design for explicit approval gate
- [ ] T012 [US1] Generate dedicated `.stitch/designs/home.DESIGN.md`

### Implementation (US1)
- [ ] T013 [P] [US1] Define Home UI types in `apps/zenith/app/features/cms/types/home.ts`
- [ ] T014 [US1] Implement `apps/zenith/app/features/cms/components/sections/HomeForm.tsx`
- [ ] T015 [US1] Write Playwright BDD test for Home Editor field validation

---

## Phase 4: User Story 2 - About Section (Priority: P2)

**Goal**: Manage personal narrative and bilingual stats.

**Independent Test**: Verify About form renders and correctly saves narrative/stats fragments.

### Design Orchestration (US2)
- [ ] T016 [US2] Enhance About prompt and generate Stitch design
- [ ] T017 [US2] Present About design for approval gate
- [ ] T018 [US2] Generate dedicated `.stitch/designs/about.DESIGN.md`

### Implementation (US2)
- [ ] T019 [P] [US2] Define About UI types in `apps/zenith/app/features/cms/types/about.ts`
- [ ] T020 [US2] Implement `apps/zenith/app/features/cms/components/sections/AboutForm.tsx`

---

## Phase 5: User Story 3 - Kinetic Reordering (Experience & Education) (Priority: P2)

**Goal**: Manage professional and academic history with high-performance drag-and-drop.

**Independent Test**: Verify items reorder at 60 FPS and the `sort` field is updated optimistically.

### Design Orchestration (US3)
- [ ] T021 [US3] Enhance Experience/Education prompts and generate designs
- [ ] T022 [US3] Present designs for approval gate
- [ ] T023 [US3] Generate `.stitch/designs/experience.DESIGN.md` and `education.DESIGN.md`

### Implementation (US3)
- [ ] T024 [P] [US3] Define History UI types (`Experience`/`Education`) with `sort` field
- [ ] T025 [US3] Implement `apps/zenith/app/features/cms/components/sections/ExperienceForm.tsx` (DND enabled)
- [ ] T026 [US3] Implement `apps/zenith/app/features/cms/components/sections/EducationForm.tsx` (DND enabled)
- [ ] T027 [US3] Write Playwright BDD test for Kinetic Sorting transitions

---

## Phase 6: User Story 4 - Managed Assets (Skills & Solutions) (Priority: P3)

**Goal**: Manage skill categories and service offerings with integrated icon curation.

**Independent Test**: Verify `IconPicker` selection and manual fallback behavior.

### Design Orchestration (US4)
- [ ] T028 [US4] Enhance Skills/Solutions prompts and generate designs
- [ ] T029 [US4] Present designs for approval gate
- [ ] T030 [US4] Generate `.stitch/designs/skills.DESIGN.md` and `solutions.DESIGN.md`

### Implementation (US4)
- [ ] T031 [P] [US4] Define Asset UI types with `icon` and `category` fields
- [ ] T032 [US4] Implement `apps/zenith/app/features/cms/components/sections/SkillsForm.tsx`
- [ ] T033 [US4] Implement `apps/zenith/app/features/cms/components/sections/SolutionsForm.tsx`

---

## Phase 7: User Story 5 - Socials & Contact (Priority: P3)

**Goal**: Manage contact channels and social links.

### Design Orchestration (US5)
- [ ] T034 [US5] Enhance Contact/Socials prompts and generate Stitch design
- [ ] T035 [US5] Present Contact design for approval gate
- [ ] T036 [US5] Generate dedicated `.stitch/designs/contact.DESIGN.md`

### Implementation (US5)
- [ ] T037 [US5] Implement `apps/zenith/app/features/cms/components/sections/ContactForm.tsx`
- [ ] T038 [US5] Implement `apps/zenith/app/features/cms/components/sections/SocialsForm.tsx`

---

## Phase 8: Polish & Global State

**Purpose**: Final visual refinements and "Maturity Lock" UX logic.

- [ ] T039 Implement `useMaturityAudit` hook for real-time Validation Strip updates
- [ ] T040 Final visual polish (Verify adherence to Oceanic Obsidian tonal contrast >4.5:1)
- [ ] T041 Verify Accessibility: Keyboard navigation and ARIA-live validation for Kinetic UI components
- [ ] T042 Cross-section audit: ensure "Live" toggle respects global maturity status
- [ ] T043 Run `pnpm biome check .` and `pnpm typecheck` across Zenith workspace

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup & Foundation (Phase 1-2)**: MUST be complete before any UI implementation.
- **Iterative Orchestration**: MUST occur per story before implementation code is written.
- **US1 (Home)**: Priority 1 (MVP). Implementation is the core delivery.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### Parallel Opportunities
- Foundations (T005-T008) can be built in parallel.
- Once foundations are ready, US1 and US2 can proceed in parallel once designs are approved.

---

## Implementation Strategy

### MVP First (Home Section)
1. Complete Setup and Foundations.
2. Design and Approve Home Section.
3. Implement Home section with Bilingual Maturity tracking.
4. **Checkpoint**: Admin can fully manage Identity assets and metadata.

### Incremental Delivery
Subsequent sections (About, Experience, etc.) follow the same loop:
Prompt -> Design -> Approve -> Implement.
