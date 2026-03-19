# Architecture Checklist: Monorepo Structure

**Purpose**: Validate that monorepo and architecture requirements are complete, clear, and consistent. This serves as a recurring gate for future PRs adding new modules.
**Created**: 2026-03-19
**Feature**: [spec.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/001-monorepo-structure/spec.md)

## Architecture Consistency (Recurring Gate)

- [x] CHK001 Are mandatory folder patterns for Frontend (`apps/web/*`) clearly defined for all feature-based modules? [Consistency, Spec §FR-004]
- [x] CHK002 Is the Clean Architecture structure for Backend/Migrator (`apps/migrator/*`) enforced across all mandated layers (api, application, domain, infrastructure)? [Consistency, Spec §FR-005]
- [x] CHK003 Are naming conventions for shared logic in `packages/shared/` explicitly specified? [Clarity, Spec §FR-006]
- [x] CHK004 Does the spec define how new apps/packages must register in the `pnpm` workspace? [Completeness, Spec §FR-001]
- [x] CHK005 Are crossing-layer logic restrictions (e.g., UI to DB direct access) documented as architectural constraints? [Coverage, Gap]

## Requirement Clarity & Completeness

- [x] CHK006 Is the "standardization" of development tools (Biome, Commitlint) quantified with specific config file locations? [Clarity, Spec §FR-002, FR-003]
- [x] CHK007 Are the pre-commit hook types (pre-commit, commit-msg, pre-push) explicitly listed for setup? [Completeness, Spec §FR-003]
- [x] CHK008 Does the spec define the fallback behavior if `pnpm install` fails to initialize the hooks? [Edge Case, Gap]
- [x] CHK009 Is the the relationship between the `Migrator` and the `Shared` package types/schemas clearly specified? [Consistency, Spec §FR-005, FR-006]

## Local Development (Debian Only)

- [x] CHK010 Is the local `.venv` isolation requirement explicitly documented for Debian environments? [Clarity, Spec §FR-003, Plan §Technical Context]
- [x] CHK011 Does the `setup-hooks.sh` requirement include error handling for missing `python3-venv` on the host? [Edge Case, Gap]
- [x] CHK012 Are manual setup steps provided for cases where `pnpm prepare` cannot be auto-triggered? [Coverage, Gap]

## Success Criteria Quality

- [x] CHK013 Are the "SC-###" outcomes Measurable without referencing specific code implementations? [Measurability, Spec §SC-001 - SC-004]
- [x] CHK014 Is "SC-003" (Performance) quantified with a specific timing threshold (under 5s)? [Clarity, Spec §SC-003]

## Notes
- Items marked `[Gap]` should be addressed in the next spec iteration if they significantly impact the architecture's maintainability.
- This checklist is a "Unit Test" for the requirements. It validates what is written, not how it's implemented.
