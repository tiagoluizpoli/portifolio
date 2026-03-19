# Quickstart: Monorepo Setup & Development

## Prerequisites
- Node.js 22+ (LTS)
- `pnpm` version 9.x (`npm install -g pnpm`)
- `python3` and `python3-venv` (for Debian/Ubuntu users)

## Initial Setup

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd portifolio
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```
   *Note: This will automatically execute the `pnpm prepare` script, which runs `scripts/setup-hooks.sh` to initialize the `.venv` and install all necessary git hooks via `pre-commit`.*

3. **Verify Git Hooks**:
   Look inside `.venv/bin/` to ensure `pre-commit` exists. You can manually run the hooks against all files:
   ```bash
   .venv/bin/pre-commit run --all-files
   ```

## Daily Operations

### Linting and Formatting
The repository uses Biome for ultra-fast linting and formatting.
- Check formatting and linting rules across all workspaces:
  ```bash
  pnpm lint
  ```
- Automatically fix safe issues:
  ```bash
  pnpm lint:fix
  ```

### Committing Changes
The repository strictly enforces **Conventional Commits** via `commitlint`.
- Example of a valid commit:
  ```bash
  git commit -m "feat(monorepo): add initial package structure"
  ```
If your commit message is invalid or if Biome finds linting errors, the commit will be blocked by the installed git hooks.

## Workspace Structure Rules
When adding new files, ensure you follow the mandated architecture:
- Frontend code goes into `apps/web/src/` or `apps/admin/src/`
- Backend migrator code goes into `apps/migrator/src/`
- Shared logic goes into `packages/shared/src/`
