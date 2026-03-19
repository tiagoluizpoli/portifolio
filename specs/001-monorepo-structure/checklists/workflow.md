# Development Workflow Checklist: Standards & Hooks

**Purpose**: Validate that the requirements for developer experience, linting, and commit standards are high-quality and testable.
**Created**: 2026-03-19
**Feature**: [spec.md](file:///home/tiago/01-dev-env/personal-repos/portifolio/specs/001-monorepo-structure/spec.md)

## Tooling Standardization & Biome

- [x] CHK020 Is the exact version of `Biome` specified to prevent formatting drifts between developers? [Clarity, Spec §FR-002]
- [x] CHK021 Are the specific Biome rule categories (linting, formatting, organizing imports) mandated? [Completeness, Spec §FR-002]
- [x] CHK022 Does the spec define a unified configuration strategy for all workspaces (single root config vs per-app)? [Consistency, Gap]
- [x] CHK023 Is the behavior for "unsafe" Biome fixes specified (auto-fix vs manual review)? [Clarity, Spec §User Story 1]

## Commit Standards & Quality Gates

- [x] CHK024 Are the mandatory `lint-staged` patterns (which files are checked) documented for each workspace type? [Completeness, Spec §FR-003]
- [x] CHK025 Is the "Conventional Commits" standard quantified with specific allowed types (feat, fix, refactor, etc.)? [Clarity, Spec §SC-004]
- [x] CHK026 Does the spec define the behavior for "breaking changes" markers in commit messages? [Coverage, Gap]
- [x] CHK027 Are the pre-push verification requirements (e.g., full typecheck or build) explicitly mentioned? [Coverage, Gap]

## Local Setup & Virtual Environment

- [x] CHK028 Is the lifecycle of the `.venv` (how and when it's updated) clearly defined? [Clarity, Spec §FR-003, Plan §Hooks Setup]
- [x] CHK029 Does the spec define the requirement for `pip` and `python3` availability on the host? [Assumption, Gap]
- [x] CHK030 Are the dependencies installed in `.venv` (pre-commit, any other python tools) explicitly listed? [Completeness, Plan §Technical Context]

## Traceability & Success Criteria

- [x] CHK031 Can "SC-002" (root lint covers all workspaces) be objectively verified without implementation details? [Measurability, Spec §SC-002]
- [x] CHK032 Is a requirement ID scheme used to trace workflow rules back to business value? [Traceability, Spec §FR-###]

## Notes
- This checklist supplements `monorepo.md` with a focus on developer experience and tooling quality.
- IDs start from CHK020 to maintain a unique global sequence for this feature.
