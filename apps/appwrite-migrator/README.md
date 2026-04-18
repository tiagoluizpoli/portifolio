# Appwrite Migrator CLI

Modular, Clean Architecture-compliant CLI for managing Appwrite schema audits, migrations, and data seeding.

## Architecture

The project follows a service-oriented architecture to reduce cognitive load and improve testability:

- **CLI Layer (`src/cli/`)**: Handles environment initialization, flag parsing, and task dispatching.
- **Application Layer (`src/services/`)**: specialized services for each mode of operation (`Check`, `Migrate`, `Seed`, `Template`).
- **Core Layer (`src/core/`)**: Shared types, constants, and base classes.
- **Infrastructure**: Leverages `@repo/appwrite` for database interactions and `@repo/config` for environment management.

## Project Structure

```text
src/
├── cli/              # MigratorCli orchestrator
├── core/             # Types, constants, errors
├── services/         # Mode-specific business logic
│   ├── seeder.ts     # Internal seeding engine
│   └── ...           # Service classes
└── index.ts          # Minimal bootstrap entry point
tests/
└── e2e/              # Orchestration & lifecycle tests
```

## Commands

| Command | Flag | Description |
|---------|------|-------------|
| Check | `--check` | Audits structural differences between blueprints and remote database. |
| Migrate | `--migrate` | Synchronizes remote database schema with local blueprints. |
| Seed | `--seed` | Upserts data from JSON payload into Appwrite collections. |
| Template | `--template` | Generates a seed JSON template based on current blueprints. |

## Development

```bash
# Run typecheck
pnpm typecheck

# Run unit and E2E tests
pnpm test

# Run the CLI in dev mode
pnpm migrator --check
```

## Import Hygiene

This project uses path aliases (`@/*`) and extensionless imports for internal modules, optimized for ESM and Node 24.
