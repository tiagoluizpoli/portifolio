# Quickstart: Appwrite-Migrator (Hardened Architecture)

## Development

1. Ensure Node.js 24 is installed.
2. Install dependencies: `pnpm install`
3. Run in dev mode: `pnpm migrator --check`

## Architecture Overview (Clean Architecture & SRP)

1. `src/index.ts`: The minimal bootstrap file (< 80 lines). Instantiates `MigratorCli`.
2. `src/cli/MigratorCli.ts`: Orchestrates **Commander.js** for flag extraction and **Zod** for runtime configuration validation.
3. `src/services/`: Contain specialized sub-directories for each mode:
    - `seeder/`: Decomposed into `Validator`, `Planner`, `Executor`, and `Generator`.
    - `check/`: Includes `CheckService` and `SchemaComparator`.
    - `migrate/`: Managed migration logic.
4. `src/core/`: Contains shared logic, base classes, and **Branded Types**.

## Testing

- **Unit Tests**: Pass with 100% coverage. Tests are co-located in `src/`.
- **E2E Tests**: Verify journeys in `tests/e2e/final-voyage.e2e.spec.ts`.
- **Quality Gate**: Run `pnpm guard` (Lint, Typecheck, Test).
