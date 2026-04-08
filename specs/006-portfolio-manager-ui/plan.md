# Implementation Plan: Portfolio Manager CMS (UI ONLY)

**Branch**: `006-portfolio-manager-ui` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: High-fidelity UI requirements for the 7-Chapter Portfolio CMS.

## Summary
Rebuild the Zenith administrative interface for portfolio management using a **UI-First** approach. The implementation prioritizes the "Curator's Studio" aesthetic (Oceanic Obsidian) and interactive kinetic patterns while mocking the Appwrite persistence layer.

## Technical Context

**Language/Version**: TypeScript / React 19 / TanStack Start (v1 RC)
**Primary Dependencies**: `dnd-kit` (Kinetic Sorting), `Iconify` (Visual curation), `Lucide` (Admin controls)
**Storage**: **MOCKED UI ONLY** (UI implements the uploader/mapping logic; mocked service returns valid `fileId` signatures).
**Testing**: Playwright (BDD for drag-and-drop & transitions) / Vitest (Maturity logic)
**Target Platform**: Zenith Administrative Shell (Desktop Web)
**Project Type**: Administrative UI Feature
**Performance Goals**: 60 FPS drag-and-drop / <300ms bilingual audit latency
**Constraints**: UI-ONLY scope / No server-side Appwrite migrations or new repositories.

## Constitution Check

*GATE: All gates passed. Focusing on Principle XVII (Design-First) and XVIII (Test-First).*

| Principle | Check | Status |
| :--- | :--- | :--- |
| XVII (Stitch Synergy) | Design authoritative visual baselines before code. | ✓ PASS |
| XVIII (Test-First) | BDD scenarios for DND and Maturity must precede implementation. | ✓ PASS |
| III (Monorepo) | All UI code stays within `apps/zenith`. | ✓ PASS |
| XV (Infra Invisibility) | UI ignores raw SDKs; uses services/hooks. | ✓ PASS |

## Project Structure

### Documentation

```text
specs/006-portfolio-manager-ui/
├── spec.md              # Requirements + Clarifications
├── plan.md              # UI-Only Technical Strategy
├── research.md          # UI / UX findings
├── data-model.md        # UI Types & Interfaces
├── quickstart.md        # Interface Guide
├── backlog-server.md    # [NEW] Isolated server logic
└── tasks.md             # UI-only task breakdown
```

### Source Code (apps/zenith)

```text
app/features/cms/
├── components/
│   ├── sections/        # HomeForm, AboutForm, ExperienceForm, etc.
│   ├── layout.tsx       # Main Container
│   ├── sidebar.tsx      # Sidebar Rail
│   ├── status-footer.tsx # Bilingual maturity progress
│   └── common/          # IconPicker, SortableList, Uploader
├── hooks/               # useMaturityAudit, useKineticDnd
├── types/               # UI Entity Interfaces
└── services/            # MaturityAuditService.ts (Shared Logic)
```

## SOLID Mapping (Principle XIX)

| Principle | Application |
| :--- | :--- |
| **S**RP | Each `SectionForm` handles only one chapter's UI logic. |
| **O**CP | `SortableList` is open to any item type via generic rendering. |
| **L**SP | All form components follow a standard `BaseCmsForm` interface. |
| **I**SP | The CMS context provides only the necessary hooks for the active section. |
| **D**I | Repository services are injected into custom hooks for easy mocking. |

## Security Boundary Map (Principle XX)

| Layer | Responsibility | Security Boundary |
| :--- | :--- | :--- |
| **Client (UI)** | Form state, DND, Visual feedback | UI Logic Only. |
| **Server Functions** | [MOCKED] Pass-through for saving data | Authoritative mutation (Assumed existing). |
