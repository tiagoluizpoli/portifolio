# Data Model: Monorepo Structure

## Workspaces
| Workspace | Path | Purpose |
|-----------|------|---------|
| `web` | `apps/web` | Landing Page (Vite 8) |
| `admin` | `apps/admin` | Management Panel (TanStack Start) |
| `migrator` | `apps/migrator` | AppWrite Schema Migrator |
| `shared` | `packages/shared` | Core logic and AppWrite types |

## Global Config Entities
- **Registry**: `pnpm-workspace.yaml`
- **Linter**: `biome.json`
- **Hooks**: `.pre-commit-config.yaml`
- **Commit Guard**: `commitlint.config.js`
