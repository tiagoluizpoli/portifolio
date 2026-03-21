# Quality Checklist: Zenith Foundation

**Purpose**: "Unit Tests for English" - Validating the quality and completeness of the Zenith setup requirements.
**Created**: 2026-03-20
**Feature**: `specs/003-zenith-setup/spec.md`

## Requirement Completeness

- [x] CHK001 - Are the exact versions (RC/Stable) for TanStack Start and React 19 specified? [Completeness, Spec §FR-001]
- [x] CHK002 - Is the use of `defineConfig` from `@tanstack/react-start/config` mandated? [Completeness, Spec §FR-006]
- [x] CHK003 - Are the required environment variables for AppWrite (Project ID, Endpoint, Secret) correctly prefixed with `VITE_` where appropriate? [Clarity, Spec §FR-007]

## Requirement Clarity

- [x] CHK004 - Is "nothing regarding the project itself" clearly bounded to exclude specific feature folders like `features/blog`? [Clarity, Spec §Input]
- [x] CHK005 - Is the term "CSS-first configuration" defined with a clear ban on `tailwind.config.js` and redirection to `src/index.css`? [Clarity, Spec §FR-003]
- [x] CHK006 - Is the usage of `createServerFn` defined with the specific `.validator()` and `.handler()` chain? [Clarity, Spec §FR-005]
- [x] CHK013 - Is the Shadcn initialization command specified with the `-t start --monorepo` flag? [Completeness, Spec §FR-004]

## Requirement Consistency

- [x] CHK007 - Does the setup requirement align with the root monorepo's Biome-only constraint? [Consistency, Spec §FR-008]
- [x] CHK008 - Are the folder naming conventions (portfolio vs zenith) consistent across the Roadmap and Spec? [Consistency]

## Acceptance Criteria Quality

- [x] CHK009 - Is "zero linting errors" objectively measurable via the Biome CLI? [Measurability, SC-001]
- [x] CHK010 - Can the "secret variable extraction" audit be performed via a specific, repeatable command? [Measurability, SC-004]

## Scenario Coverage

- [x] CHK011 - Does the spec define the behavior when the required `.env` variables are missing on startup? [Coverage, Edge Case]
- [x] CHK012 - Are requirements defined for handling SSR hydrate mismatches during initial setup? [Coverage, Gap]
- [x] CHK014 - Are the domain models (Home, Experience, etc.) defined as a single source of truth in `@repo/appwrite-core`? [Completeness, Spec §FR-009]
- [x] CHK015 - Does the spec require mapping of AppWrite's `Permission Denied` error to a specific `PermissionDeniedException`? [Clarity, Spec §FR-010]
- [x] CHK016 - Is the "Repository Pattern" defined with enough detail to ensure decoupling from the AppWrite SDK? [Clarity, Spec §FR-009]
- [x] CHK017 - Are the error mapper requirements consistent across the technical plan and specification? [Consistency]
- [x] CHK018 - Is the manual code audit process (SC-004) described with at least one verifiable step or outcome? [Clarity, Success Criteria, Spec §SC-004]
- [x] CHK019 - Does the spec for the startup error page (FR-011) explicitly mandate listing the missing keys? [Clarity, Spec §FR-011]
- [x] CHK020 - Are foundational React 19 patterns (e.g., direct `ref` prop) mandated for all new components? [Consistency, Spec §FR-002]
