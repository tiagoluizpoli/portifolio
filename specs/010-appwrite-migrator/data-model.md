# Data Model: Appwrite Migrator

This document defines the data structures and entities used internally by the Appwrite Migrator to manage schema state and data synchronization.

## Entities

### 1. CollectionBlueprint (Location: `@repo/appwrite`)
Represents the desired state of an Appwrite Table (Collection).

- **id**: string (Table ID)
- **name**: string (Display Name)
- **columns**: `ColumnDefinition[]`
- **indexes**: `IndexDefinition[]`

### 2. ColumnDefinition (Location: `@repo/appwrite`)
Represents a column (attribute) within a table.

- **key**: string
- **type**: `string` | `integer` | `float` | `boolean` | `datetime` | `email` | `enum` | `url` | `ip`
- **required**: boolean
- **default**: unknown (optional)
- **array**: boolean (for multi-value columns)
- **elements**: string[] (only for `enum` type)
- **size**: number (only for `string` type)

### 3. IndexDefinition
Represents an index on one or more columns.

- **key**: string
- **type**: `key` | `unique` | `fulltext`
- **attributes**: string[]
- **orders**: string[] (optional)

### 4. MigrationPlan
Represents the calculated adjustments needed to align remote state with local blueprints.

- **pendingTables**: `CollectionBlueprint[]`
- **pendingColumns**: Map<TableID, `ColumnDefinition[]`>
- **pendingIndexes**: Map<TableID, `IndexDefinition[]`>

### 5. SeedSource
Metadata for the JSON data source.

- **bucketId**: string
- **fileId**: string
- **fileName**: string

## Validation Rules
- All Column IDs must be alphanumeric and start with a letter.
- Every "Seeding" operation must validate the source JSON against the corresponding Zod schema in `@repo/appwrite/src/schemas`.
- Migrations are strictly additive; the engine will not drop existing columns or tables automatically to prevent data loss.
