# Implementation Plan: Zenith Portfolio Hub (Phase 1)

**Branch**: `004-ui-design-shadcn` | **Date**: 2026-03-21 | **Spec**: [004-ui-design-shadcn/spec.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/004-ui-design-shadcn/spec.md)

## Summary
Implementing the Zenith Portfolio Hub shell and analytics dashboard. Focuses on an interactive, high-density layout with a collapsible sidebar and a personal visitor tracking system. The architecture adheres to **Principle VIII (SOLID)** by decoupling the UI (`apps/zenith`) from the persistence layer via a `Use Case` and `Repository` system in `packages/appwrite-core`.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 (RC)  
**Primary Dependencies**: TanStack Start v1 (RC), Lucide React, Shadcn UI, `@repo/appwrite-core`  
**Storage**: Appwrite TablesDB (Collections: `projects`, `analytics`)  
**Testing**: Vitest (Unit), Playwright (E2E)  
**Target Platform**: Web (Desktop-First, 1,920x1,080 optimized)
**Project Type**: Admin Dashboard (Personal Utility)  
**Performance Goals**: < 200ms TBT, 60fps animations for sidebar transitions.  
**Constraints**: Biome-only linting, Root-level Git only, Zero PII analytics.  
**Scale/Scope**: 3 Core Screens (Analytics Dashboard, Portfolio Manager, Settings).

## Constitution Check

1. **Principle VIII (SOLID)**: Use Cases and Repository patterns used in `@repo/appwrite-core`.
2. **Principle XVI (TanStack RC)**: Native latest synchronization for all `@tanstack` libraries.
3. **Principle II (Appwrite-Centric)**: Single authority for data via Appwrite TablesDB.
4. **Principle IX (Tooling)**: Biome enforcement; no ESLint/Prettier.

## Project Structure

### Documentation
```text
specs/004-ui-design-shadcn/
├── plan.md              # Restored Technical Plan
├── research.md          # Layout Density & Analytics Research
├── data-model.md        # Analytics & Project Entities
├── checklists/          # Requirements Quality Audit
└── tasks.md             # Implementation Phase Breakdown
```

### Source Code
```text
apps/zenith/
├── app/
│   ├── routes/
│   │   ├── __root.tsx    # Layout with Sidebar Trigger & Interactive Sidebar
│   │   ├── index.tsx      # Analytics Dashboard (KPIs, Geo list)
│   │   ├── manager.tsx    # Portfolio Content Manager
│   │   └── settings.tsx   # Appearance & System Config
│   └── components/
│       ├── sidebar/       # Custom Shadcn Sidebar component
│       └── dashboard/     # Metric Cards & Activity Streams
packages/appwrite-core/
├── src/
│   ├── use-cases/         # Business Logic (e.g., GetAnalyticsSummary)
│   └── repositories/      # Appwrite TablesDB Connectors
```

**Structure Decision**: Monorepo with a decoupled business layer to ensure clean code and testability.

## Phase 3+ Prompts

### [PROMPT: Phase 1 Layout]
"A premium, ultra-compact Zenith Portfolio Hub. Desktop-First (1920x1080). **Interactive Sidebar**: Toggle between Open, Compact (Icons), and Collapsed modes. `SidebarTrigger` in the Topbar. Aesthetic: Zenith Obsidian. **Extreme Density** (`p-2`, `gap-2`). **Row Symmetry** (Flex items-stretch). No 'Pro' elements."

### [PROMPT: Phase 1 Dashboard]
"Personal Portfolio Analytics Dashboard. Top KPI Row: 'Visitors' (+trend), 'Avg. Session' (30s heartbeat tracking), 'Active Projects'. Middle Row: 'Visitor Geolocation' list (Country/State) and 'Recent Interactions' feed. High-density, row-symmetric cards."

## Complexity Tracking

| Violation | Why Needed | Rationale |
|-----------|------------|-----------|
| Use Case Layer | Principle XV | Essential for DI and testability; avoids coupling UI to Appwrite SDK. |
