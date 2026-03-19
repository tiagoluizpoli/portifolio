# Portifolio Monorepo

Establish a robust, standard foundation for project development.

## 🏗️ Architecture

This repository is organized as a `pnpm` monorepo:

- **`apps/web`**: Primary frontend application (Feature-based structure).
- **`apps/admin`**: Administrative dashboard (Feature-based structure).
- **`apps/migrator`**: Database and infrastructure service (Strict Clean Architecture).
- **`packages/appwrite-core`**: Shared domain entities and AppWrite infrastructure logic.

### Mandatory Folder Patterns

#### Clean Architecture (Migrator)
Every module must follow: `api/`, `application/`, `domain/`, `infrastructure/`, `main/`.

#### Feature-Based (Frontend)
Unified structure: `assets/`, `components/`, `features/`, `domain/`, `infrastructure/`, `hooks/`, `lib/`, `providers/`, `routes/`.

## 📜 Development Standards

### SOLID Principles
1. **Single Responsibility (SRP)**: Each workspace and module has one clear purpose.
2. **Open/Closed (OCP)**: Core entities are extensible without modification.
3. **Interface Segregation (ISP)**: Shared types are granular.
4. **Dependency Inversion (DIP)**: High-level modules depend on abstractions in `appwrite-core`.

### Quality Gates
- **Linting**: Unified via Biome (`pnpm lint`).
- **Commit Messages**: Conventional Commits monitored by Commitlint.
- **Git Hooks**: Managed via `pre-commit` (initialized by `pnpm install`).

### Restrictions
- **No Cross-Layer Leakage**: UI components must never access the database directly.
- **No Cyclical Dependencies**: Dependencies between workspaces must be unidirectional.
- **Shared Purpose**: `@repo/appwrite-core` is the ONLY place for shared AppWrite schemas.

## 🚀 Getting Started

1. `pnpm install` (initializes hooks and venv).
2. `pnpm lint` to verify code quality.

---
*Legacy code archived in `/legacy` folder.*
