# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Establish a premium, high-density administrative interface for Zenith using Shadcn UI and Tailwind CSS v4. The design will follow a "Desktop First" strategy with symmetric, data-rich layouts validated against Google Stitch designs.

## Technical Context

**Language/Version**: TypeScript 5.7+ / React 19  
**Primary Dependencies**: TanStack Start v1 (RC), Tailwind CSS v4, Shadcn UI, Geist Typography  
**Storage**: Appwrite (Server Functions + Repository Pattern)  
**Testing**: Vitest + Playwright (deferred for UI)  
**Target Platform**: Modern Desktop Browsers (Chrome/Safari/Firefox)  
**Project Type**: Administrative Web Application  
**Performance Goals**: TTI < 2.5s, TBT < 200ms per table page  
**Constraints**: OKLCH colors exclusively, Geist Sans/Mono, Row Symmetry (items-stretch)  
**Scale/Scope**: 3 core management screens (Dashboard, Portfolio, Settings)

## Constitution Check (v1.9.0)

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle XII (Mandatory Quality Gating)**: Verifying via root `pnpm lint/typecheck/test`.
- [x] **Principle XVI (TanStack RC)**: Enforcing `latest` tags for all TanStack modules.
- [x] **Principle XVII (Stitch Synergy)**: Stitch-generated designs are the authoritative source of truth.
- [x] **Principle XIV (Repository Pattern)**: Decoupling domain logic from Appwrite SDK.

## Project Structure

### Documentation

```text
specs/004-ui-design-shadcn/
├── plan.md              # Technical design and phases
├── research.md          # Visual parity and OKLCH exploration
├── data-model.md        # UI state and component schemas
├── screen-map.md        # Navigation and screen hierarchy
└── tasks.md             # Implementation tasks
```

### Source Code

```text
apps/zenith/src/
├── components/          # Shared Shadcn UI components
├── features/            # Bulletproof features
│   ├── dashboard/       # Analytics and KPIs
│   ├── manager/         # Portfolio CRUD
│   └── settings/        # System configuration
└── routes/              # Lightweight orchestrators
```

**Structure Decision**: Bulletproof Feature-based pattern adapted for TanStack Start (Zenith Standard).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
