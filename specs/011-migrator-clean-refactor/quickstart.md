# Quickstart: Appwrite-Migrator (Refactored)

## Development

1. Ensure Node.js 24 is installed.
2. Install dependencies: `pnpm install`
3. Run in dev mode: `pnpm migrator --check`

## Architecture Overview

1. `src/index.ts`: The bootstrap file. Instantiates `MigratorCli`.
2. `src/cli/MigratorCli.ts`: Parses CLI flags and loads environment variables.
3. `src/services/`: Contains one file per mode (Seed, Migrate, etc.).
4. `src/core/`: Contains shared logic and base classes.

## Testing

- **Unit Tests**: Run `pnpm test`. Tests are co-located in `src/`.
- **E2E Tests**: Run `pnpm test:e2e`. Tests are in `tests/e2e/`.
