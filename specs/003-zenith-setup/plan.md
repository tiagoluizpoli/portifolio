# Implementation Plan: Zenith Setup (v1.1)

**Feature**: `003-zenith-setup` | **Status**: Execution (Audit Phase) | **Revision**: 2026-03-22

## Technical Context

- **Framework**: TanStack Start v1 (RC/Stable) + React 19.
- **Styling**: Tailwind CSS v4 (CSS-first) + Shadcn UI.
- **Structure**: **Bulletproof React** directory pattern (`src/features/{feature}`).
- **Resilience**: `TransactionManager` (AppWrite Core) + Blocking Overlay (Pointer-Lock).
- **Theming**: Zero-flash `ThemeProvider` (< 50ms FCP target).
- **Connectivity**: Redirection to `/connection-lost` after 3 failures OR 10s timeout.
- **Persistence**: `useFormPersistence` with `zenith:form-backup:*` namespace (24h expiry).

## Constitution Check (v1.9.0 Alignment)

- [x] **Principle XII (Mandatory Root-Level Quality Gates)**: ALL verification must run via root `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- [x] **Principle XVI (TanStack RC)**: Use `latest` tags for all `@tanstack/*` packages.
- [x] **Principle XVII (Stitch Synergy)**: High-fidelity designs from Stitch are the authoritative baseline.
- [x] **Principle III/IX/XIV (Monorepo Integrity)**: Single VCS, root-level Biome config. **Baseline project (`clean-tanstack-proj`) is IGNORED to prevent noise.**

## Phase 0: Research & Alignment (research.md)
- [x] Verify TanStack Start v1 RC hydration patterns.
- [x] Map OKLCH color interpolation for Tailwind v4.
- [x] Define `TransactionManager` compensation strategies.

## Phase 1: Design & Contracts (data-model.md)
- [x] Define Zod schemas for `Home` and `Portfolio` entities.
- [x] Establish server function contracts for AppWrite interaction.
- [x] Initialize Bulletproof feature boundaries.

## Phase 2: Core Infrastructure (Done)
- [x] Router factory, environment validation, shell component.
- [x] ThemeProvider with fixed logic comments.
- [x] Resilience suite (Overlay, Persistence, Monitor).

## Verification Plan

### Automated
- `pnpm session:verify` (root): Must pass 100% (baseline ignored).
- `vitest` (zenith): Dummy smoke tests and resilience logic tests.

### Manual
- **Zero-Flash Timing**: Performance tab audit (< 50ms).
- **Failure Simulation**: Network kill → Verify recovery flow + form persistence.
- **Security Audit**: Grep production bundle for secrets.
