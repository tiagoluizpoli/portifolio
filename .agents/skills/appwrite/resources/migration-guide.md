# Appwrite Schema Migration Guide

---

## Migration Philosophy

Every schema change in Appwrite is a production operation. These rules govern all migrations:

1. **Never destructive by default** — Never `deleteAttribute` unless explicitly planned
2. **Idempotent always** — Every migration step must be safe to run twice
3. **Atomic where possible** — Group related changes; validate the group together
4. **Rollback documented** — Every migration specifies its rollback procedure

---

## Migration File Structure

```
packages/migrator/src/
├── db/
│   ├── schema.manager.ts      ← Orchestrates all migrations
│   ├── collection.factory.ts  ← Creates/validates collections
│   └── attribute.factory.ts   ← Creates/validates attributes + indexes
├── migrations/
│   ├── v1-initial-schema.ts
│   ├── v2-add-skill-icon.ts
│   ├── v3-social-links.ts
│   └── v4-soft-delete.ts
└── seed/
    ├── seed-about.ts
    └── seed-skills.ts
```

---

## Migration Template

```typescript
// migrations/v2-add-skill-icon.ts
import { Databases, AppwriteException } from 'node-appwrite';
import { DB_ID, COLLECTIONS } from '../constants';

export const VERSION = 'v2';
export const DESCRIPTION = 'Add icon attribute to skills collection';

export async function up(databases: Databases): Promise<void> {
  console.log(`[${VERSION}] Running: ${DESCRIPTION}`);

  // Step 1: Add string attribute
  await ensureStringAttribute(
    databases,
    COLLECTIONS.SKILLS,
    'icon',
    100,          // maxLength
    false,        // required
    null,         // default
  );

  // Step 2: Add fulltext index on name (if not exists)
  await ensureIndex(
    databases,
    COLLECTIONS.SKILLS,
    'idx_name_fulltext',
    'fulltext',
    ['name'],
  );

  console.log(`[${VERSION}] Complete.`);
}

export async function down(databases: Databases): Promise<void> {
  console.log(`[${VERSION}] Rolling back: ${DESCRIPTION}`);
  // Rollback: remove the attribute
  // NOTE: This destroys data — only run in dev/staging
  try {
    await databases.deleteAttribute(DB_ID, COLLECTIONS.SKILLS, 'icon');
    console.log(`[${VERSION}] Rollback complete.`);
  } catch (e) {
    if (e instanceof AppwriteException && e.code === 404) {
      console.log(`[${VERSION}] Attribute already gone — rollback skipped.`);
      return;
    }
    throw e;
  }
}
```

---

## Idempotent Attribute Helpers

```typescript
// db/attribute.factory.ts — All helpers are safe to run multiple times

async function ensureStringAttribute(
  databases: Databases,
  collectionId: string,
  key: string,
  maxLength: number,
  required: boolean,
  defaultValue: string | null = null,
): Promise<void> {
  try {
    const existing = await databases.getAttribute(DB_ID, collectionId, key);
    // Validate it matches expectations
    if (existing.size !== maxLength) {
      console.warn(`  ⚠️  Attribute '${key}' exists but maxLength differs (${existing.size} vs ${maxLength})`);
    }
    console.log(`  ↳ '${key}' already exists — skipping`);
  } catch (e) {
    if (e instanceof AppwriteException && e.code === 404) {
      await databases.createStringAttribute(DB_ID, collectionId, key, maxLength, required, defaultValue ?? undefined);
      console.log(`  ↳ Created string attribute '${key}'`);
      // Wait for attribute to be active (Appwrite processes async)
      await waitForAttributeActive(databases, collectionId, key);
    } else {
      throw e;
    }
  }
}

async function ensureIntegerAttribute(
  databases: Databases,
  collectionId: string,
  key: string,
  required: boolean,
  min?: number,
  max?: number,
  defaultValue?: number,
): Promise<void> {
  try {
    await databases.getAttribute(DB_ID, collectionId, key);
    console.log(`  ↳ '${key}' already exists — skipping`);
  } catch (e) {
    if (e instanceof AppwriteException && e.code === 404) {
      await databases.createIntegerAttribute(DB_ID, collectionId, key, required, min, max, defaultValue);
      console.log(`  ↳ Created integer attribute '${key}'`);
      await waitForAttributeActive(databases, collectionId, key);
    } else {
      throw e;
    }
  }
}

async function ensureBooleanAttribute(
  databases: Databases,
  collectionId: string,
  key: string,
  required: boolean,
  defaultValue?: boolean,
): Promise<void> {
  try {
    await databases.getAttribute(DB_ID, collectionId, key);
    console.log(`  ↳ '${key}' already exists — skipping`);
  } catch (e) {
    if (e instanceof AppwriteException && e.code === 404) {
      await databases.createBooleanAttribute(DB_ID, collectionId, key, required, defaultValue);
      console.log(`  ↳ Created boolean attribute '${key}'`);
      await waitForAttributeActive(databases, collectionId, key);
    } else {
      throw e;
    }
  }
}

async function ensureIndex(
  databases: Databases,
  collectionId: string,
  key: string,
  type: 'key' | 'fulltext' | 'unique',
  attributes: string[],
  orders?: ('ASC' | 'DESC')[],
): Promise<void> {
  try {
    await databases.getIndex(DB_ID, collectionId, key);
    console.log(`  ↳ Index '${key}' already exists — skipping`);
  } catch (e) {
    if (e instanceof AppwriteException && e.code === 404) {
      await databases.createIndex(DB_ID, collectionId, key, type, attributes, orders);
      console.log(`  ↳ Created ${type} index '${key}' on [${attributes.join(', ')}]`);
    } else {
      throw e;
    }
  }
}

// Wait for Appwrite to process the attribute (it's async under the hood)
async function waitForAttributeActive(
  databases: Databases,
  collectionId: string,
  key: string,
  maxWaitMs = 30_000,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const attr = await databases.getAttribute(DB_ID, collectionId, key);
    if (attr.status === 'available') return;
    if (attr.status === 'failed') throw new Error(`Attribute '${key}' failed to create`);
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for attribute '${key}' to become available`);
}
```

---

## Collection Factory

```typescript
// db/collection.factory.ts
async function ensureCollection(
  databases: Databases,
  collectionId: string,
  name: string,
  permissions: string[],
  documentSecurity: boolean = true,
): Promise<void> {
  try {
    await databases.getCollection(DB_ID, collectionId);
    console.log(`Collection '${name}' exists — skipping`);
  } catch (e) {
    if (e instanceof AppwriteException && e.code === 404) {
      await databases.createCollection(DB_ID, collectionId, name, permissions, documentSecurity);
      console.log(`Created collection '${name}'`);
    } else {
      throw e;
    }
  }
}
```

---

## Schema Manager — Migration Orchestrator

```typescript
// db/schema.manager.ts
import * as v1 from '../migrations/v1-initial-schema';
import * as v2 from '../migrations/v2-add-skill-icon';
import * as v3 from '../migrations/v3-social-links';

const MIGRATIONS = [v1, v2, v3]; // Order matters

export class SchemaManager {
  constructor(private databases: Databases) {}

  async runAll(): Promise<void> {
    console.log('=== Schema Migration Start ===');
    for (const migration of MIGRATIONS) {
      console.log(`\n[${migration.VERSION}]: ${migration.DESCRIPTION}`);
      await migration.up(this.databases);
    }
    console.log('\n=== Schema Migration Complete ===');
  }

  async rollback(toVersion: string): Promise<void> {
    const idx = MIGRATIONS.findIndex(m => m.VERSION === toVersion);
    if (idx === -1) throw new Error(`Version '${toVersion}' not found`);
    for (let i = MIGRATIONS.length - 1; i >= idx; i--) {
      await MIGRATIONS[i].down(this.databases);
    }
  }
}
```

---

## Seeding Pattern

```typescript
// seed/seed-skills.ts
async function seedSkills(databases: Databases, userId: string): Promise<void> {
  const SEED_SKILLS = [
    { name: 'TypeScript', level: 9, category: 'frontend', icon: 'logos:typescript' },
    { name: 'React', level: 9, category: 'frontend', icon: 'logos:react' },
    { name: 'Node.js', level: 8, category: 'backend', icon: 'logos:nodejs' },
    { name: 'TanStack Start', level: 8, category: 'fullstack', icon: 'logos:tanstack' },
    { name: 'Appwrite', level: 8, category: 'backend', icon: 'logos:appwrite' },
    { name: 'Tailwind CSS', level: 9, category: 'frontend', icon: 'logos:tailwindcss' },
  ];

  console.log('Seeding skills...');
  for (const skill of SEED_SKILLS) {
    await databases.createDocument(
      DB_ID,
      COLLECTIONS.SKILLS,
      ID.unique(),
      { ...skill, userId },
      [Permission.read(Role.any()), Permission.write(Role.user(userId))]
    );
    console.log(`  ↳ Created skill: ${skill.name}`);
  }
}
```

---

## Migration Checklist

Before running any migration in production:

- [ ] Tested migration locally against a copy of production data
- [ ] Migration script is idempotent (ran twice? Same result?)
- [ ] Rollback procedure documented and tested
- [ ] Appwrite dashboard backed up (export)
- [ ] All downstream code is compatible with new schema
- [ ] Zero downtime plan: can old code and new schema coexist during deploy?
- [ ] Post-migration validation script ready
