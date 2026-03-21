# Implementation Plan: Zenith UI Design Phase (Shadcn First)

**Branch**: `004-ui-design-shadcn` | **Date**: 2026-03-21 | **Spec**: [spec.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/004-ui-design-shadcn/spec.md)

## Summary
Build the Zenith Management Hub (Admin Dashboard) using TanStack Start and Shadcn UI. This phase focuses on establishing a premium, high-density administrative layout and visual language across 5 core screens.

## Technical Context

**Language/Version**: TypeScript / React 19 / TanStack Start v1 (RC)  
**Primary Dependencies**: Shadcn UI, Tailwind 4+, Lucide React  
**Storage**: AppWrite (integrated via shared core)  
**Testing**: Biome (Linting) / Vitest (if added later)  
**Target Platform**: Zenith Management Hub (`apps/zenith`)
**Project Type**: Administrative Web Application  
**Performance Goals**: <200ms initial render / Immediate state updates  
**Constraints**: Shadcn FIRST / Pure Style Phase / Premium Admin Aesthetic  
**Scale/Scope**: 5 Management Screens + Global Shell

## Constitution Check

| Clause | Pass/Fail | Rationale |
|--------|-----------|-----------|
| I. Simplicity First | Pass | Pure style focus avoid over-engineering. |
| III. Monorepo Architecture | Pass | Project located in `apps/zenith`. |
| V. Design Source of Truth | Pass | Adhering to "Premium Admin Hub" and Shadcn standards. |
| XVI. TanStack RC Standards | Pass | Using TanStack Start v1 RC in `apps/zenith`. |

## Phased Implementation

### Phase 1: Shell & Core Hub
- **Target**: `__root.tsx` (Layout), `index.tsx` (Dashboard).
- **Goal**: Establish navigation and global style.
- **Stitch Prompt**: Layout-centric, Sidebar, Topbar, KPI Grid.

### Phase 2: Administrative Control
- **Target**: `/users` (User Management), `/logs` (Audit Logs).
- **Goal**: Implement data-heavy administrative views.
- **Stitch Prompt**: Table-centric, Filter/Search, Row Actions.

### Phase 3: Content & Config
- **Target**: `/manager` (Portfolio Manager), `/settings` (System Settings).
- **Goal**: Implement dynamic configuration and content management.
- **Stitch Prompt**: Form-centric, Tabs, Sheet sidebars for editing.

## StitchMCP Prompt Strategy

> [!IMPORTANT]
> The prompts below are designed to be robust and component-specific to ensure Shadcn compliance and high-density premium layouts.

### [PROMPT: Phase 1 Layout]
"A premium administrative layout for the Zenith Management Hub. Use Shadcn Sidebar navigation with collapsible items. Navigation items: Dashboard, User Management, Portfolio Manager, System Settings, Audit Logs. Global topbar with Breadcrumb, Command-K Search input showing hierarchical results (Pages, Users, Projects), and User Profile dropdown. Aesthetic: Clean, dark mode by default, brand-violet accents. High-density, intelligent space usage. Lucide icons."

### [PROMPT: Phase 1 Dashboard]
"High-impact admin dashboard for Zenith. Main content: 4-column KPI grid (Total Users, Project Entries, Active Sessions, System Health) using Shadcn Cards with pulsing 'Live' indicators. Below grid: 'Recent System Activity' feed using Shadcn ScrollArea and Table-lite (Infinite Scroll). 'Infrastructure Health' section with Progress and Badge indicators. Premium executive feel."
