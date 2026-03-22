# Implementation Plan: Zenith Setup (Checklist Aligned)

**Branch**: `003-zenith-setup` | **Date**: 2026-03-22 | **Spec**: [spec.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/003-zenith-setup/spec.md)

## Summary
Establish a high-fidelity foundation for Zenith by mirroring `clean-tanstack-proj` and adopting **Bulletproof React** modularity. This plan is fully audited against the quality checklist, incorporating measurable metrics for **zero-flash timing**, **connection failure limits**, and **form persistence** namespace isolation.

## Technical Context

**Structure**: Bulletproof features in `src/features/`. Routes < 100 LoC.
**Resilience**: `TransactionManager` + **Pointer-Locked** Blocking UI.
**Connectivity**: Redirect after **3 failures** + **24h** localStorage backup.
**Theming**: `ThemeProvider` initialization **< 50ms** (FCP).

## Constitution Check
- **Principle XVI (TanStack RC)**: Verified.
- **Principle XVII (Stitch Synergy)**: Verified.

## Phase 1: Foundation & Sync
1.  **Sync Package**: Mirror `clean-tanstack-proj` dependencies.
2.  **Config**: `vite.config.ts`, `components.json`.

## Phase 2: Bootstrapping & Theme Synergy
1.  **Theme Logic**: Port `THEME_INIT_SCRIPT` to `ThemeProvider` with **< 50ms** target.
2.  **Logic**: Lock core theme logic with immutable comments after verification.
3.  **Loading**: Global `nprogress` bar integration.

## Phase 3: Resilience & Hybrid Logic
1.  **Backup**: Implement `useFormPersistence` using `zenith:form-backup:*` namespace.
2.  **Rollback**: Implement `TransactionManager` + **Pointer-Lock** overlay.
3.  **Fail-Fast**: Implement redirect to "Connection Lost" after **3 consecutive failures**.

## Phase 4: Implementation (US1-US4)
1.  **Feature Base**: Initialize `src/features/` modular dashboard feature.
2.  **US1**: Root index route orchestrator (< 100 LoC).
3.  **Stitch**: Validate visual parity via **identical OKLCH variables**.

## Verification Plan
- **Theme Audit**: Verify initialization < 50ms via Performance tab.
- **Persistence Audit**: Fill form → 3x failures → Verify backup in `localStorage`.
- **Security Audit**: `grep` dist for leaked API keys.
