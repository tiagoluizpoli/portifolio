# Code Quality — Smells, Naming & Dead Code

---

## The 20 Code Smells — Complete Reference

Every code smell below is a flag. Not every smell requires immediate refactoring, but every one must be documented in the review report.

---

### 1. Duplicated Code

**Definition**: The same logic appears in 2 or more places.

```typescript
// ❌ SMELL: Same validation pattern in 3 different places
// In SkillForm.tsx:
if (!name || name.length < 1) throw new Error('Name required');

// In AboutForm.tsx:
if (!bio || bio.length < 1) throw new Error('Bio required');

// ✅ REFACTOR: Shared validation utility OR Zod schema reuse
const requiredString = (field: string) =>
  z.string().min(1, `${field} is required`);
```

**Detection:**
```bash
# Look for repeated error patterns
grep -rn "throw new Error" . --include="*.ts" --include="*.tsx" | \
  grep -v node_modules | sort | uniq -d
```

---

### 2. Long Functions (> 30 lines)

**Definition**: A function that's too long has too many responsibilities.

**Decomposition heuristic**: If you can describe what the function does using "AND" (`validates AND formats AND saves AND ...`), it should be split.

```typescript
// ❌ SMELL: 80-line function doing multiple things
const processSkillSubmission = async (data: unknown) => {
  // Validate (10 lines)
  // Transform (10 lines)
  // Save to Appwrite (15 lines)
  // Invalidate cache (5 lines)
  // Send notification (15 lines)
  // Log analytics (10 lines)
};

// ✅ REFACTOR: Each step is a named function
const processSkillSubmission = async (data: unknown) => {
  const validated = validateSkill(data);
  const transformed = transformSkill(validated);
  const saved = await saveSkill(transformed);
  await invalidateSkillsCache();
  await notifySkillCreated(saved);
  logSkillAnalytics(saved);
};
```

---

### 3. Primitive Obsession

**Definition**: Using primitive types (`string`, `number`) to represent domain concepts.

```typescript
// ❌ SMELL: Passing raw strings everywhere — are they IDs? Names? URLs?
function getUser(id: string): User { ... }
function createDocument(db: string, collection: string, docId: string) { ... }

// ✅ REFACTOR: Branded types for domain identifiers
type UserId = string & { readonly __brand: 'UserId' };
type DatabaseId = string & { readonly __brand: 'DatabaseId' };
type CollectionId = string & { readonly __brand: 'CollectionId' };

function getUser(id: UserId): User { ... }
function createDocument(db: DatabaseId, collection: CollectionId, docId: DocumentId) { ... }
```

---

### 4. Feature Envy

**Definition**: A function uses more data from another object/module than from its own.

```typescript
// ❌ SMELL: SkillCard is obsessed with skill.meta data
const SkillCard = ({ skill }: { skill: Skill }) => {
  const iconName = skill.meta.icon.name;
  const iconColor = skill.meta.icon.color;
  const iconSize = skill.meta.icon.size;
  return <Icon name={iconName} color={iconColor} size={iconSize} />;
};

// ✅ REFACTOR: Move the logic to where the data lives, or extract
const SkillCard = ({ skill }: { skill: Skill }) => {
  return <SkillIcon meta={skill.meta} />;
};

const SkillIcon = ({ meta }: { meta: SkillMeta }) => (
  <Icon name={meta.icon.name} color={meta.icon.color} size={meta.icon.size} />
);
```

---

### 5. Data Clumps

**Definition**: Three or more parameters that always appear together should become a type.

```typescript
// ❌ SMELL: Same three params appear across 10 functions
function createDocument(db: string, collection: string, id: string) { ... }
function getDocument(db: string, collection: string, id: string) { ... }
function updateDocument(db: string, collection: string, id: string, data: object) { ... }

// ✅ REFACTOR: Introduce a DocumentRef type
interface DocumentRef {
  db: DatabaseId;
  collection: CollectionId;
  id: DocumentId;
}
function createDocument(ref: DocumentRef, data: object) { ... }
function getDocument(ref: DocumentRef) { ... }
```

---

### 6. Shotgun Surgery

**Definition**: A single conceptual change requires many small changes in many different files.

```
Signal: Adding a new field to the About section required changes in:
  - types/about.ts
  - schemas/about.schema.ts
  - components/AboutForm.tsx
  - components/AboutPreview.tsx
  - seeds/about.seed.ts
  - migrations/v3.ts
  - tests/about.test.ts
  ... (7 files for one field)

This is by system design in some cases (schema-driven systems), but flag it
when the same change keeps causing the same spread — it suggests the schema
isn't the single source of truth it should be.
```

---

### 7. Switch Statements on Type Tags

**Definition**: A long switch on `kind`, `type`, `variant` — usually signals polymorphism needed.

```typescript
// ❌ SMELL: Adding a new media type requires modifying this function
function renderMedia(media: Media) {
  switch (media.type) {
    case 'image': return <Image src={media.url} />;
    case 'video': return <Video src={media.url} />;
    case 'pdf':   return <PDF src={media.url} />;
    // ... 10 more cases
  }
}

// ✅ REFACTOR: Map to components — open for extension
const MEDIA_RENDERERS: Record<Media['type'], FC<{ media: Media }>> = {
  image: ImageMedia,
  video: VideoMedia,
  pdf:   PDFMedia,
};

const renderMedia = (media: Media) => {
  const Renderer = MEDIA_RENDERERS[media.type];
  return Renderer ? <Renderer media={media} /> : null;
};
```

---

### 8. Comments That Explain "What" Instead of "Why"

```typescript
// ❌ SMELL: Comment explains what the code does (the code should do that)
// increment counter by 1
count++;

// ❌ SMELL: Commented-out code
// const oldResult = processLegacy(data);
const result = processNew(data);

// ✅ GOOD: Comment explains WHY (non-obvious business reason)
// Appwrite collections use $createdAt instead of createdAt — must sort manually
const sorted = docs.sort((a, b) =>
  new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
);
```

**Scanner for commented-out code:**
```bash
grep -rn "^[[:space:]]*//" . --include="*.ts" --include="*.tsx" | \
  grep -E "const |let |var |function |return " | \
  grep -v node_modules | head -20
```

---

### 9. Inconsistent Abstractions at the Same Level

```typescript
// ❌ SMELL: High-level and low-level operations mixed
const processOrder = async (order: Order) => {
  await validateOrder(order);                          // High-level: function call
  const conn = await db.connect();                    // LOW-level: manual connection
  const stmt = conn.prepare('INSERT INTO orders...');// LOW-level: raw SQL
  await stmt.run(order.id, order.total);             // LOW-level: raw execution
};

// ✅ REFACTOR: Consistent abstraction level
const processOrder = async (order: Order) => {
  await validateOrder(order);
  await orderRepository.create(order); // Same level as validateOrder
};
```

---

### 10. Dead Code — Detection Scanner

```bash
echo "=== DEAD CODE SCANNER ==="

# Exports that appear unused (basic check)
echo "\n[Potentially Unused Exports]"
git diff --name-only HEAD | while read f; do
  grep -n "^export " "$f" 2>/dev/null | while IFS=: read lineno line; do
    # Extract the export name
    name=$(echo "$line" | grep -oE "(function|const|class|interface|type|enum) [A-Za-z_]+" | \
           awk '{print $2}')
    [ -z "$name" ] && continue
    # Count usages across the codebase (excluding the definition itself)
    usage=$(grep -r "\b$name\b" . --include="*.ts" --include="*.tsx" | \
            grep -v node_modules | grep -v "$f" | wc -l | tr -d ' ')
    [ "$usage" -eq 0 ] && echo "  ⚠️  $f:$lineno — '$name' may be unused"
  done
done

# TODO/FIXME/HACK that have been there too long
echo "\n[Stale TODOs]"
grep -rn "TODO\|FIXME\|HACK\|XXX\|BUG\|TEMP" . --include="*.ts" --include="*.tsx" | \
  grep -v node_modules | head -20

# Variables declared but never used
echo "\n[Unused Variables — rely on TS for exactness]"
pnpm typecheck 2>&1 | grep "is declared but"
```

---

## Naming Convention Reference

### Variables & Constants

| Pattern | Convention | Example |
|:---|:---|:---|
| Booleans | `is/has/can/should` prefix | `isLoading`, `hasError`, `canSubmit` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_FILE_SIZE`, `DB_ID` |
| Readonly config | `SCREAMING_SNAKE_CASE` | `DEFAULT_THEME` |
| Private fields | `_` prefix (classes only) | `_cache` |

### Functions & Methods

| Pattern | Convention | Example |
|:---|:---|:---|
| Event handlers (props) | `on` prefix | `onClick`, `onSave`, `onChange` |
| Event handlers (impl) | `handle` prefix | `handleClick`, `handleSave` |
| Async functions | Verb + noun | `fetchSkills`, `createDocument` |
| Predicates | `is/has/can` prefix | `isValid()`, `hasPermission()` |
| Transformers | Verb + in/out | `toAppwriteSkill`, `fromAppwriteSkill` |

### Components & Files

| Pattern | Convention | Example |
|:---|:---|:---|
| React components | PascalCase | `SkillCard`, `MetricDialog` |
| Component files | kebab-case | `skill-card.tsx`, `metric-dialog.tsx` |
| Hook files | kebab-case | `use-skills.ts`, `use-form-state.ts` |
| Utility files | kebab-case | `format-date.ts`, `appwrite-utils.ts` |
| Type files | kebab-case | `skill.types.ts`, `about.types.ts` |
| Test files | `[name].test.ts(x)` | `skill-card.test.tsx` |

### TypeScript Types & Interfaces

| Pattern | Convention | Example |
|:---|:---|:---|
| Interfaces | PascalCase, no `I` prefix | `Skill`, `User`, not `ISkill` |
| Type aliases | PascalCase | `SkillId`, `FormState` |
| Generic parameters | Descriptive (not T,U,V) | `TEntity`, `TResult`, `TInput` |
| Union type members | PascalCase | `'idle' \| 'loading' \| 'success'` |
| Enums (if used) | PascalCase + SCREAMING values | `Status.ACTIVE` |

---

## Code Quality Quick Scan

```bash
echo "=== CODE QUALITY SCAN ==="

echo "\n[Naming: any type]"
grep -rn "\bany\b" . --include="*.ts" --include="*.tsx" | grep -v node_modules

echo "\n[Naming: boolean without is/has/can]"
grep -rn "const \(loading\|error\|valid\|disabled\|active\)\b" . --include="*.tsx" | \
  grep -v node_modules | sed 's/^/  ⚠️  Missing is/has prefix: /'

echo "\n[Magic Numbers]"
grep -rn "[0-9]\{3,\}" . --include="*.ts" --include="*.tsx" | \
  grep -v node_modules | grep -v "//.*[0-9]" | head -15

echo "\n[Console.log (should not be in production code)]"
grep -rn "console\.log\b" . --include="*.ts" --include="*.tsx" | \
  grep -v node_modules | grep -v ".test." | grep -v ".spec."

echo "\n=== END CODE QUALITY SCAN ==="
```
