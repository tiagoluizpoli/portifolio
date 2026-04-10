# Implementation Plan: Zenith CMS Refinement

**Branch**: `008-zenith-cms-refinement` | **Date**: 2026-04-10 | **Spec**: `/specs/008-zenith-cms-refinement/spec.md`

## Summary

Refactor the Zenith Portfolio CMS infrastructure and interface to support globalized data scopes, semantic metric synchronization, and professional brand management. The project will transition for a localized "Portfolio Manager" to a professional and scalable **"Portfolio CMS"**, leveraging the multi-locale "Ghost Row" parity system for impact metrics and a high-fidelity split-layout for landing page administration.

## Technical Context

**Language/Version**: TypeScript 5.7+ / Node 22.x
**Primary Dependencies**: React 19, TanStack Start/Router (RC), Appwrite v22+ (TablesDB), Iconify (@iconify/react)
**Storage**: Appwrite Databases (Collections: Skills, ImpactMetrics, Platforms)
**Testing**: Vitest (Unit/Integration), Playwright (E2E), React Testing Library (Components)
**Target Platform**: Zenith Administrative Shell (Web)
**Performance Goals**: 
- < 100ms for UI state updates within the split-layout.
- Parallelized migration (< 5s for collection flattening).
**Constraints**: Zero data loss during Skills globalization; strict cross-locale parity for Metrics.

## Round-Based Execution Strategy (MANDATORY)

To ensure maximum focus and regression safety, implementation is divided into **Verification Rounds**. Each round must be approved before starting the next.

| Round | Title | Core Objective | Status |
| :--- | :--- | :--- | :--- |
| **Round 1** | **Infrastructure (Infra)** | Data model migration, Schema hardening, and Repository refactors. | PENDING |
| **Round 2** | **Global Shell (Global)** | "/portfolio-cms/" routing, Rebranding, and Atomic Components. | PENDING |
| **Round 3** | **Feature: Skills** | Globalization of competency cards and grid optimizations. | PENDING |
| **Round 4** | **Feature: Metrics** | Semantic parity engine implementation (kebab-case sync). | PENDING |
| **Round 5** | **Feature: Home** | Deployment of the 50/50 split dashboard and Media previews. | PENDING |
| **Round 6** | **Feature: Platforms** | Managed social network side-drawer and pre-seeding. | PENDING |

> [!IMPORTANT]
> **Approval Gate**: Each round MUST be verified and approved by the user before starting the next.
> **VCS Isolation**: Once a Round is approved, its artifacts and UI states are considered **Authoritative**.

## Constitution Check

| Principle | Impact | Status |
| :--- | :--- | :--- |
| **VIII. Clean Code & SOLID** | SRP applied to `PlatformRepository` and `MetricSyncService`. | ✅ |
| **XIII. TablesDB v22** | All mutations MUST use the object-parameter style and transactional integrity. | ✅ |
| **XVIII. Test-First** | **MANDATORY**: Each round preceded by `test-plan.md` scenario tasks. | ✅ |
| **XXI. Test Immutability** | Tests are the authoritative source for Round approval. | ✅ |
| **XXII. Round Safeguard** | Round $N+1$ cannot modify Round $N$ approved UI/Logic. | ✅ |

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
│       ├── home.tsx                    # [MOD] Round 5 (Split Layout)
│       ├── skills.tsx                  # [MOD] Round 3 (Grid)
│       └── metrics.tsx                 # [MOD] Round 4 (Parity Logic)

packages/appwrite-core/src/domain/
├── cms/chapters/
│   ├── assets.ts                       # [MOD] Skill (Drop Locale)
│   ├── metrics.ts                      # [MOD] Metric (Add Code)
│   └── platforms.ts                    # [NEW] Platform Entity
└── repositories/
    ├── interfaces.ts                   # [MOD] Skill/Platform Repos
    └── implementation/                 # Appwrite implementations
```

## SOLID Mapping (Principle XIX)

- **Single Responsibility (SRP)**:
    - `MetricSyncService`: Isolated logic for propagating translations across locales using `internalCode`.
    - `CmsSaveButton`: Decoupled mutation trigger handling from feature-specific forms.
- **Open-Closed (OCP)**:
    - The `Platform` entity is designed to support any future social/professional network via Iconify without schema changes.
- **Dependency Inversion (DIP)**:
    - Zenith UI sections depend on the `CmsContext` and Core Repositories, ensuring infrastructure can be swapped without changing UI components.

## Security Boundary Map (Principle XX)

- **SERVER-SIDE (Appwrite / Functions)**:
    - Data Persistence and Schema Integrity.
    - Cascading Metric Deletion logic (enforcing parity at the source).
    - Platform pre-seeding logic.
- **CLIENT-SIDE (Zenith React)**:
    - Real-time Maturity Auditing (visual only).
    - 50/50 Split-Layout rendering and Client-side field validation.
    - Media Preview rendering (PDF/Image readers).

## Proposed Changes (In-Depth)

### Phase 1: Infrastructure Round (Foundation)
- **Repo Refactor**: Update `ISkillRepository` to remove `locale` parameter from `getByLocale`.
- **Metric Expansion**: Implement `internalCode` (semantic kebab-case) linking in `MetricSyncService`.
- **Platforms Table**: Create `Platforms` collection with `name: 'Platforms'`, attributes `[name, iconCode, status]`.

### Phase 2: Global Shell Round (UI Identity)
- **Branding**: Global search/replace "Portfolio Manager" -> "Portfolio CMS".
- **Prefixing**: Update `tsr.config.json` and route folder structure to prefix all chapter routes with `/portfolio-cms/`.

### Phase 3-6: Feature Section Rounds
- **Skills**: Compact Aceternity-style grid with 36px icons leading titles.
- **Metrics**: Synchronized dialog creation; "Manual" mode vs "System Source" mapping. 1:1 parity deletion for all translation fragments sharing an `internalCode`.
- **Home**: Split layout (left: 50% form; right: 50% Asset Preview window). Uses persistent `CmsSaveButton` at the bottom of the form column.

## Verification Plan

### Automated Tests (Vitest & RTC)
- `TC-BE-001`: Global fetch returns consolidated set regardless of locale ID.
- `TC-BE-004`: Deleting metric 'active-users' in EN deletes it in all locales.
- `TC-FE-003`: "System Source" toggle in creation dialog correctly disables value inputs.

### Manual Verification (Round Gates)
- **Round 1 Gate**: Verify Appwrite console shows 3 updated collections with correct attributes.
- **Round 2 Gate**: Verify URL `/portfolio-cms/home` correctly renders.
- **Round 6 Gate**: Verify newly created social platform icon appears in Contact links.
