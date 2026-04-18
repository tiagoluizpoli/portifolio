# Data Model & Entites: Appwrite-Migrator

## Unified Service Contract

All migrator modes will implement the following contract to ensure consistency and modularity:

```typescript
export interface IMigratorService {
  execute(context: MigratorContext): Promise<void>;
}
```

## Domain Entities

### MigratorContext
Represents the runtime state required for any operation.
- `appwrite`: { endpoint, projectId, databaseId, apiKey }
- `env`: { seedBucketId, seedFileName, templateOutputFilePath }
- `cli`: { rawArgs, parsedMode }

### MigrationStructuralDelta
(Extracted from existing logic)
- `missingTables`: string[]
- `missingColumns`: Array<{ tableId: string, columnId: string }>

### SeedUpsertPlan
(Extracted from existing logic)
- `operations`: SeedUpsertOperation[]
- `summary`: { create: number, update: number, ignore: number }

## Validation Rules
- CLI must explicitly reject multiple mode flags.
- Environment variables must be validated using Zod at the CLI entry point.
- Appwrite credentials must be verified before service execution.
