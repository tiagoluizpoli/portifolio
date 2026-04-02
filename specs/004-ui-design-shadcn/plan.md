# Technical Plan: Zenith UI Design Phase (Shadcn First)

This plan defines the architectural strategy for implementing the primary administrative shell and dashboard of the Zenith Hub using TanStack Start v1 (RC) and React 19.

## Architecture & Stack
- **Framework**: TanStack Start v1 (RC standards). [Constitution §XVI]
- **Language**: TypeScript (Type-safe schemas). [Constitution §VI]
- **Styling**: Tailwind CSS v4 + Shadcn UI (High-density). [Constitution §I]
- **Icons**: Lucide React.
- **Analytics**: MockDataEngine (Seed-based metrics).
- **Core Strategy**: Back-to-Front (Infrastructure centralization in @repo/appwrite-core). [Constitution §XV]

## SOLID Mapping [Constitution §XIX]
- **Single Responsibility (SRP)**: UI components are isolated from data-fetching via Application Services.
- **Dependency Inversion (DIP)**: `LayoutShell` depends on slot components, not concrete route implementations.
- **Open-Closed (OCP)**: `Sidebar` navigation is schema-driven to allow expansion without core logic changes.

## Security Boundary Mapping [Constitution §XX]
| Component | Boundary | Rationale |
|-----------|----------|-----------|
| **UI Components** | Client | Rendering Shadcn elements and interactive states. |
| **Data Fetching** | Server | **Server Functions** to hide Appwrite endpoints and secrets. |
| **Validation** | Both | Zod schemas shared between client and server layers. |

## Phases

### Phase 1: Project Alignment (Migration)
- [X] Move `src/` to `app/` and update module resolution.
- [X] Centralize `SystemConfigRepository` in `@repo/appwrite-core`.

### Phase 2: Administrative Shell & Layout
- [X] Implement `LayoutShell.tsx` (Grid-based row symmetry).
- [X] Implement `Sidebar.tsx` (7-entity navigation).
- [X] Implement `Topbar.tsx` (Sticky utility header).

### Phase 3: Route Initialization & Dashboard
- [X] Update `__root.tsx` with the shell integration.
- [X] Initialize `index.tsx` (Dashboard) with KPI cards.
- [X] Initialize `settings.tsx` with System tab.

### Phase 4: Build System Repair (Critical)
- [ ] Inject `@vitejs/plugin-react` to resolve `ReferenceError: React is not defined`.
- [ ] Verify JSX transformation compatibility with React 19.
- [ ] Reconcile entry point naming (entry-client.tsx vs client.tsx).

## Technical Constraints
- **Zero Error Policy**: Mandatory `typecheck` and `biome check` gating. [Constitution §XII]
- **Hydration Safety**: Essential use of `ClientOnly.tsx` for interactive components. [Constitution §XVI]
- **Premium Aesthetic**: Enforce Oceanic Obsidian theme and high-density spacing.
