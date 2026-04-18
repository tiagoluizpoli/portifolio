# CLI Contract: Appwrite-Migrator

## Command Line Interface (CLI)

The migrator is invoked via `node src/index.ts` (or the `migrator` script).

### Commands (Flags)

| Flag | Mode | Description |
|------|------|-------------|
| `--check` | `check` | Audit current Appwrite state against local definitions. Errors if out of sync. |
| `--migrate` | `migrate` | Apply structural changes (table/column creation) to Appwrite. |
| `--seed` | `seed` | Import data from a template file in Appwrite Storage into the database. |
| `--template` | `template` | Generate a local `seed-template.json` and `seed-template.md` based on current schema. |

### Environment Variables

| Variable | Required In | Description |
|----------|-------------|-------------|
| `APPWRITE_ENDPOINT` | All | Appwrite server URL. |
| `APPWRITE_PROJECT_ID` | All | Target project ID. |
| `APPWRITE_API_KEY` | All | API Key with appropriate permissions. |
| `APPWRITE_DATABASE_ID` | All | Target database ID. |
| `SEED_BUCKET_ID` | `seed` | Storage bucket where the template is stored. |
| `SEED_FILE_NAME` | `seed` | File name in the bucket to use for seeding. |

### Exit Codes
- `0`: Success.
- `1`: Unexpected error or validation failure.
- `2`: Audit check failure (`--check` mode with pending changes).
