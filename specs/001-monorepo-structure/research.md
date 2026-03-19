# Research: Monorepo Structure

## Decisions & Rationale

### 1. Unified Tooling (Linting & Formatting)
- **Decision**: Use Biome (`@biomejs/biome`) version `~2.3.12`.
- **Rationale**: Biome replaces multiple tools (ESLint, Prettier, TypeScript ESLint constraints) with a single, highly performant Rust-based tool. It aligns perfectly with the "Simplicity First" core principle of the constitution.
- **Alternatives Considered**: ESLint + Prettier. Rejected due to configuration complexity, slower execution times, and dependency bloat.

### 2. Pre-commit Hooks Management
- **Decision**: Use the Python-based `pre-commit` framework, isolated within a `.venv` created via `scripts/setup-hooks.sh` on `pnpm prepare`.
- **Rationale**: The `pre-commit` framework is language-agnostic and provides robust, out-of-the-box support for strict Git hooks. By isolating it in a local `venv`, we avoid polluting the global Python environment on Debian-based systems while ensuring all developers use the exact same hook versions.
- **Alternatives Considered**: 
  - `husky` (Node-based): Initially common in JS, but `pre-commit` offers better multi-language support (useful if we add generic scripts, Rust, or Python in the future).
  - Global `pre-commit` installation: Rejected as Debian actively blocks global pip installations (`EXTERNALLY-MANAGED`).

### 3. Monorepo Package Management
- **Decision**: `pnpm ^9.x` workspaces.
- **Rationale**: Strict dependency resolution prevents phantom dependencies. Workspaces natively support local package linking (e.g., `packages/shared`), making code sharing between the frontend and the AppWrite Migrator seamless.
- **Alternatives Considered**: `npm` workspaces (slower, less strict), `yarn` (complex PnP model).

### 4. Code Architecture & Folder Patterns
- **Decision**: Feature-sliced structure for frontend apps, Clean Architecture for the backend migrator.
- **Rationale**: Frontend UI needs modular scalability (features). Backend logic requires strict layer separation (domain, application, infrastructure, api) to ensure AppWrite SDK dependencies don't leak into core business rules. 
- **Alternatives Considered**: Flat structure. Rejected as it violates architectural scalability goals.
