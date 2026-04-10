# Implementation Plan: Zenith CMS Refinement

**Branch**: `008-zenith-cms-refinement` | **Date**: 2026-04-10 | **Spec**: `/specs/008-zenith-cms-refinement/spec.md`

## Summary

Refactor the Zenith Portfolio CMS infrastructure and interface to support globalized data scopes, semantic metric synchronization, and professional brand management. The project will transition from a localized "Portfolio Manager" to a professional and scalable **"Portfolio CMS"**, leveraging the multi-locale "Ghost Row" parity system for impact metrics and a high-fidelity 1:1 split-layout for landing page administration.

## Technical Context

**Language/Version**: TypeScript 5.7+ / Node 22.x
**Primary Dependencies**: React 19, TanStack Start/Router (RC), Appwrite v22+ (TablesDB), TanStack Form v12+ (+ Zod Adapter)
**Storage**: Appwrite Databases (Collections: Skills, ImpactMetrics, Platforms)
**Testing**: Vitest (Unit/Integration), Playwright (E2E)
**Target Platform**: Zenith Administrative Shell (Web)
**Performance Goals**: 
- < 100ms for UI state updates within the split-layout.
- Zero layout shift during dialog transitions.
**Constraints**: Zero data loss for EN Skills during globalization; strict cross-locale parity for Metrics via `internalCode`.

## Round-Based Execution Strategy (MANDATORY)

To ensure maximum focus and regression safety, implementation is divided into **Verification Rounds**. Each round must be approved before starting the next.

| Round | Title | Core Objective | Status |
| :--- | :--- | :--- | :--- |
| **Round 1** | **Infrastructure (Infra)** | 'en-source' Skill globalization, Localized Solutions, Schema hardening, and Platforms. | DONE |
| **Round 2** | **Global Shell (Global)** | "/portfolio-cms/" routing prefix and `CmsSaveButton` unification. | PENDING |
| **Round 3** | **Feature: Skills/Solutions** | Globalized Skill Grid and Localized Solution Grid refactor. | PENDING |
| **Round 4** | **Feature: Metrics** | Semantic parity engine implementation (kebab-case/Ghost Row sync). | PENDING |
| **Round 5** | **Feature: Home** | Deployment of the 1:1 split dashboard and Asset Previews. | PENDING |
| **Round 6** | **Feature: Platforms** | Managed social network side-drawer CRUD and pre-seeding. | PENDING |

> [!IMPORTANT]
> **Approval Gate**: Each round MUST be verified and approved by the user before starting the next.
> **VCS Isolation**: Once a Round is approved, its artifacts and UI states are considered **Authoritative**.

## Constitution Check

| Principle | Impact | Status |
| :--- | :--- | :--- |
| **VIII. Clean Code & SOLID** | SRP applied to Repositories; Composite Pattern for components > 300 lines. | ✅ |
| **XIII. TablesDB v22** | All mutations MUST use the object-parameter style. | ✅ |
| **XVIII. Test-First** | **MANDATORY**: Each round preceded by `test-plan.md` scenario tasks. | ✅ |
| **XX. Security Boundary Map** | Server-side for data integrity; Client-side for layout rendering. | ✅ |
| **XXI. Test Immutability** | Tests are the authoritative source for Round approval. | ✅ |

## Project Structure (Target)

```text
apps/zenith/app/
├── features/
│   ├── cms/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   └── CmsSaveButton.tsx   # [NEW] Round 2
│   │   │   ├── platforms/
│   │   │   │   └── PlatformDrawer.tsx    # [NEW] Round 6
│   │   │   └── metrics/
│   │   │       └── MetricCard.tsx      # [MOD] Round 4
│   │   └── hooks/
│   │       └── use-maturity-audit.ts   # [MOD] Round 2
├── routes/
│   └── portfolio-cms/                   # [PREFIX CHANGE] Round 2
│       ├── home.tsx                    # [MOD] Round 5 (1:1 Split Layout)
│       ├── skills.tsx                  # [MOD] Round 3 (Grid)
│       ├── solutions.tsx               # [MOD] Round 3 (Grid)
│       └── metrics.tsx                 # [MOD] Round 4 (Sync Logic)
```

## SOLID Mapping (Principle XIX)

- **Single Responsibility (SRP)**:
    - `MetricSyncService` handles ONLY the propagation of metric placeholders.
    - `CmsSaveButton` decouples persistence triggers from form layout.
- **Dependency Inversion (DIP)**:
    - UI depends on generic domain interfaces (`ISkillRepository`), ensuring infrastructure independence.

## Security Boundary Map (Principle XX)

- **SERVER-SIDE (Appwrite / Migrator)**:
    - EN-source Skill migration (deleting non-EN content).
    - Metric parity creation (ensuring consistency in DB).
- **CLIENT-SIDE (Zenith React)**:
    - 50/50 Split-Layout and Asset Preview rendering.
    - TanStack Form validation (Zod).

## Verification Plan

### Automated Tests
- `TC-BE-001`: Global fetch returns EN-source skills only.
- `TC-FE-001`: Home section renders 1:1 split at desktop sizes.
- `TC-FE-004`: Metric form validation (Manual vs Source).

### Manual Verification
- **Appwrite Console**: Verify `locale` attribute removal from `skills`.
- **Zenith UI**: Verify persistence of `CmsSaveButton` across all sections.
