# Implementation Plan: Monorepo Structure (Clean Architecture)

**Branch**: `001-monorepo-structure` | **Date**: 2026-03-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-monorepo-structure/spec.md`

## Summary

Establish a robust `pnpm` monorepo structure, unified linting with Biome, standard commit hooks with Conventional Commits, and enforce a mandatory Clean Architecture (migrator) and Feature-based (frontend) folder pattern. The core domain and shared AppWrite logic will be consolidated into a semantic `@repo/appwrite-core` package.

## Technical Context

**Language/Version**: TypeScript 5.8+ | Node 22+ (LTS). Host requires `python3` and `pip` (specifically `python3-venv` on Debian) for hook management.
**Primary Dependencies**: `pnpm >=9.0.0`, `@biomejs/biome ~2.3.12`, `zod ^3.x`, `pre-commit`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`
**Performance Goals**: Lint and pre-commit checks in < 5 seconds (measured locally on a warm cache).
**Quality Standards**: **SOLID** and **Clean Code** enforced across all layers:
- **Single Responsibility (SRP)**: Each workspace and module has one clear purpose.
- **Open/Closed (OCP)**: Core entities are extensible without modification.
- **Interface Segregation (ISP)**: Shared types in `appwrite-core` are granular.
- **Dependency Inversion (DIP)**: High-level modules don't depend on low-level ones; both depend on abstractions in `appwrite-core`.
**Constraints**: 
- Absolute adherence to the mandatory folder pattern. 
- No business logic implementation.
- **Cross-Layer Restrictions**: UI components must never access the DB directly (Clean Architecture compliance).
- **Dependency Rules**: Cyclical dependencies between workspaces are strictly banned.
- **Unsafe Fix Governance**: AI agents MUST NOT auto-apply `biome --unsafe` without explicit user clarification (FR-011).

## Constitution Check

| Principle | Check | Status |
|-----------|-------|--------|
| I. Simplicity First | Single root Biome config replaces multiple lint/format tools. | PASS |
| II. AppWrite-Centric | `appwrite-core` consolidates all shared AppWrite schemas and clients. | PASS |
| III. Monorepo Architecture | `pnpm` workspace setup with semantic `@repo/` internal names. | PASS |
| IV. Mandatory Roadmap Alignment | Foundational structural prerequisite. | PASS |
| V. Design Source of Truth | `apps/web` structure explicitly reserves `assets/` for inspirations. | PASS |

## Architecture & Integration Standards

### Package: `@repo/appwrite-core`
- **Location**: `packages/appwrite-core`
- **Responsibility**: Pure domain entities (Zod), shared AppWrite infrastructure types, and common utility logic.
- **Clean Code Rule**: Must not contain UI or application-specific logic.

### AI Governance & Resilience
- **Collaborative Unsafe Fixes**: In alignment with FR-011, any ambiguous `biome --unsafe` suggestion requires a `/speckit.clarify` turn.
- **Venv Resilience**: `setup-hooks.sh` includes TTY checks and `python3-venv` validation for Debian stability.
- **Fallback**: `pnpm run clean:hooks` provided for recovery.

## Project Structure

```text
apps/
├── web/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── config/
│       ├── domain/
│       ├── features/
│       ├── hooks/
│       ├── infrastructure/
│       ├── lib/
│       ├── providers/
│       └── routes/
├── admin/
│   └── src/ (same as web)
└── migrator/
    └── src/
        ├── api/
        ├── application/
        ├── domain/
        ├── infrastructure/
        └── main/

packages/
└── appwrite-core/
    └── src/
        ├── domain/
        └── infrastructure/

scripts/
└── setup-hooks.sh

.github/
└── workflows/
    └── ci.yml

biome.json
commitlint.config.js
.pre-commit-config.yaml
.lintstagedrc
pnpm-workspace.yaml
```

**Structure Decision**: Monorepo using `pnpm` workspaces. Frontend follows Feature-Sliced/Inspiration-driven design. Migrator follows strict Clean Architecture.
