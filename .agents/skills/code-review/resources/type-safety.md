# Type Safety — Zero Tolerance TypeScript Standards

---

## Hard Blocks (Zero Tolerance)

These patterns are **never acceptable**. Every instance is a BLOCKING finding.

### Block 1: `any` Type

```typescript
// ❌ BLOCKED — All of these
const response: any = await fetch(url);
function processData(input: any): any { ... }
const handler = (event: any) => event.target.value;
const data = JSON.parse(text) as any;

// ✅ REPLACEMENTS

// Instead of any for API responses → type + Zod validation
const ResponseSchema = z.object({ id: z.string(), name: z.string() });
type Response = z.infer<typeof ResponseSchema>;
const parsed = ResponseSchema.safeParse(await response.json());

// Instead of any for event handlers → proper event types
const handler = (event: React.ChangeEvent<HTMLInputElement>) => event.target.value;
const clickHandler = (event: React.MouseEvent<HTMLButtonElement>) => { ... };

// Instead of any for unknown data → unknown + type guard
function processData(input: unknown): ProcessedResult {
  if (!isValidInput(input)) throw new ValidationError('Invalid input');
  return transform(input);
}
```

**Scanner:**
```bash
grep -rn "\bany\b" . --include="*.ts" --include="*.tsx" | grep -v node_modules | \
  grep -v "//.*\bany\b" | \
  grep -v "Array<" | grep -v "Record<" | \
  sed 's/^/🚫 BLOCKED: /'
```

---

### Block 2: Unguarded Type Assertions (`as`)

```typescript
// ❌ BLOCKED: No evidence the assertion is correct
const user = data as User;
const id = value as string;
const el = document.getElementById('root') as HTMLDivElement;

// ✅ ACCEPTABLE: Type assertion with documented guarantee
// SAFETY: Schema validated by Zod before this point
const user = data as User;

// ✅ BETTER: Type guard instead of assertion
function isUser(val: unknown): val is User {
  return (
    typeof val === 'object' && val !== null &&
    typeof (val as Record<string, unknown>).id === 'string' &&
    typeof (val as Record<string, unknown>).name === 'string'
  );
}
```

---

### Block 3: `@ts-ignore` Without Comment

```typescript
// ❌ BLOCKED: Silently suppressing TypeScript
// @ts-ignore
callBrokenThing();

// ✅ ACCEPTABLE: Suppression with clear justification
// @ts-ignore — third-party library type definition is incorrect (tracked in issue #123)
callBrokenThing();

// ✅ BETTER: Use @ts-expect-error (will fail if the error goes away)
// @ts-expect-error — see issue #123
callBrokenThing();
```

---

### Block 4: `@ts-nocheck`

```typescript
// ❌ BLOCKED: Turning off type checking for an entire file
// @ts-nocheck

// There is no acceptable use of @ts-nocheck in production code.
// If a third-party library is causing issues, create a .d.ts override.
```

---

## Required Patterns

### Pattern 1: Zod as Single Source of Truth

All data that enters the system from outside (user input, API response, URL params, localStorage) MUST pass through Zod validation.

```typescript
// Schema → derive TypeScript type from it (never the reverse)
const SkillSchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  level: z.number().int().min(1).max(10),
  category: z.enum(['frontend', 'backend', 'fullstack', 'devops']),
  icon: z.string().optional(),
});

type Skill = z.infer<typeof SkillSchema>;    // TypeScript type derived from schema
type CreateSkillInput = z.input<typeof SkillSchema>;  // Input type (before transform)
type SkillOutput = z.output<typeof SkillSchema>;      // Output type (after transform)

// safeParse for user-facing errors (returns Result, never throws)
const result = SkillSchema.safeParse(userInput);
if (!result.success) {
  return { error: result.error.flatten().fieldErrors };
}
const validated = result.data; // Guaranteed correct type

// parse for internal operations (throws on invalid — use when data should always be valid)
const skill = SkillSchema.parse(databaseRecord);
```

---

### Pattern 2: Discriminated Unions for State

Never use boolean flags to represent mutually exclusive states. Use discriminated unions.

```typescript
// ❌ BLOCKED: Boolean flag soup
interface QueryState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data?: Skill[];
  error?: Error;
  // Question: can isLoading and isError both be true? Unclear.
}

// ✅ REQUIRED: Discriminated union — impossible to be in two states at once
type QueryState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Usage forces handling all cases explicitly
function render(state: QueryState<Skill[]>) {
  switch (state.status) {
    case 'idle':    return <Placeholder />;
    case 'loading': return <Skeleton />;
    case 'success': return <SkillsList skills={state.data} />;
    case 'error':   return <ErrorBoundary error={state.error} />;
  }
}
```

---

### Pattern 3: Branded Types for Domain IDs

Prevent accidentally passing one ID type where another is expected.

```typescript
// ❌ BLOCKED: Raw strings for IDs — no type safety at call site
function getSkill(skillId: string) { ... }
function getUser(userId: string) { ... }
// Compiler allows: getSkill(userId) — silently wrong

// ✅ REQUIRED: Branded types
declare const _brand: unique symbol;
type Branded<T, TBrand> = T & { [_brand]: TBrand };

type SkillId = Branded<string, 'SkillId'>;
type UserId  = Branded<string, 'UserId'>;

// Type-safe constructors
const skillId = (id: string) => id as SkillId;
const userId  = (id: string) => id as UserId;

function getSkill(id: SkillId) { ... }
// Now: getSkill(userId) → TypeScript error ✅
```

---

### Pattern 4: Exhaustive Union Handling

```typescript
// ❌ MISSED: Partial switch on a union
type Icon = 'check' | 'x' | 'alert' | 'info';
function renderIcon(icon: Icon) {
  if (icon === 'check') return <Check />;
  if (icon === 'x') return <X />;
  // 'alert' and 'info' not handled — silently returns undefined
}

// ✅ REQUIRED: Use never for exhaustiveness check
function renderIcon(icon: Icon): JSX.Element {
  switch (icon) {
    case 'check': return <Check />;
    case 'x':     return <X />;
    case 'alert': return <Alert />;
    case 'info':  return <Info />;
    default: {
      const _exhaustive: never = icon; // TypeScript error if a case is missed
      throw new Error(`Unhandled icon: ${icon}`);
    }
  }
}
```

---

### Pattern 5: Strict Return Types on Server Functions

```typescript
// ❌ BLOCKED: Implicit return type inference (can widen accidentally)
async function fetchSkills() {
  return databases.listDocuments(DB_ID, SKILLS_ID); // Returns Appwrite document, not Skill[]
}

// ✅ REQUIRED: Explicit return types + transformation
async function fetchSkills(): Promise<Skill[]> {
  const response = await databases.listDocuments(DB_ID, SKILLS_ID);
  return response.documents.map(doc => SkillSchema.parse(doc)); // Validates at boundary
}
```

---

### Pattern 6: `readonly` for Immutable Data

```typescript
// ❌ MISSED: Mutable arrays and objects where mutation is unintended
const DEFAULT_FILTERS = ['active', 'featured'];
DEFAULT_FILTERS.push('archived'); // Silently mutates the "constant"

// ✅ REQUIRED: readonly prevents accidental mutation
const DEFAULT_FILTERS = ['active', 'featured'] as const;
const SETTINGS: Readonly<Settings> = { theme: 'dark', lang: 'en' };

// For function parameters that shouldn't be mutated
function processItems(items: readonly Item[]) { ... }
```

---

## Type Safety Scanner

```bash
echo "=== TYPE SAFETY SCANNER ==="

echo "\n[Any Types]"
grep -rn "\bany\b" . --include="*.ts" --include="*.tsx" | \
  grep -v node_modules | grep -v "//.*any" | head -20

echo "\n[Unsafe Assertions]"
grep -rn " as [A-Z][a-zA-Z]*[^,>;)]" . --include="*.ts" --include="*.tsx" | \
  grep -v node_modules | grep -v "// SAFETY:" | head -20

echo "\n[Non-null Assertions]"
grep -rn "[a-zA-Z]!" . --include="*.ts" --include="*.tsx" | \
  grep -v node_modules | grep -v "// SAFETY:" | head -20

echo "\n[@ts-ignore or @ts-nocheck]"
grep -rn "@ts-ignore\|@ts-nocheck" . --include="*.ts" --include="*.tsx" | \
  grep -v node_modules | grep -v "// @ts-ignore —"

echo "\n[Missing Zod validation before mutations]"
grep -rn "\.createDocument\|\.updateDocument\|\.deleteDocument" . \
  --include="*.ts" --include="*.tsx" | grep -v node_modules | \
  while IFS=: read file lineno line; do
    # Check if safeParse or parse appears recently in the same file
    context=$(sed -n "$((lineno-15)),$((lineno-1))p" "$file" 2>/dev/null)
    if ! echo "$context" | grep -q "safeParse\|\.parse\|validator"; then
      echo "  ⚠️  $file:$lineno — Mutation without visible validation"
    fi
  done

echo "\n=== END TYPE SAFETY SCANNER ==="
```
