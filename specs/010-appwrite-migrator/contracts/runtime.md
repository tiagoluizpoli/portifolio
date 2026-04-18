# Runtime Contract: Appwrite Migrator

The Appwrite Migrator is a containerized Node application designed to be executed during the pre-deployment phase of the CI/CD pipeline. It functions as a standard Node script driven by environment variables.

## Environment Variables

| Variable               | Required        | Description                                                                     |
| :--------------------- | :-------------- | :------------------------------------------------------------------------------ |
| `APPWRITE_ENDPOINT`    | Yes             | The full URL of the Appwrite API.                                               |
| `APPWRITE_PROJECT`     | Yes             | The target Project ID.                                                          |
| `APPWRITE_API_KEY`     | Yes             | An API key with `databases.write` and `collections.write` permissions.          |
| `APPWRITE_DATABASE_ID` | Yes             | The ID of the primary database to migrate/seed.                                 |
| `MIGRATOR_MODE`        | Yes             | One of: `check`, `migrate`, `seed`.                                             |
| `SEED_BUCKET_ID`       | Only for `seed` | The bucket containing the legacy JSON file.                                     |
| `SEED_FILE_NAME`       | Only for `seed` | The file name of the JSON file to use for seeding (resolved inside the bucket). |

## Execution Modes

### 1. `check`
Audits the remote Appwrite instance against the local schema blueprints.
- **Input**: None beyond env vars.
- **Output**: Logs list of pending changes.
- **Exit Code**: `0` if synced, `1` if pending changes exist, `>1` on error.

### 2. `migrate`
Idempotently applies schema definitions (Tables, Columns, Indexes).
- **Input**: Blueprints defined in code.
- **Output**: Logs applied changes.
- **Exit Code**: `0` on success, `>0` on error.

### 3. `seed`
Synchronizes data from the provided JSON file.
- **Input**: JSON file fetched from Appwrite Storage.
- **Output**: Success/Failure metrics (records synced vs aborted).
- **Exit Code**: `0` on success, `>0` on error.

## Error Handling
- The script MUST catch all exceptions and log them to `stderr`.
- Failed seeds MUST log the specific record indices that failed validation or constraints.
