# Example: React Component Review

**Scenario**: Reviewing a newly submitted `StatCard.tsx` component for the Dashboard section of a generic CMS application.

---

## Step 0: Pre-Review Setup

```bash
$ git diff --name-only HEAD
apps/cms/components/dashboard/stat-card.tsx
apps/cms/components/dashboard/stat-dialog.tsx
packages/ui/components/profile-form.tsx

$ pnpm guard
✓ Lint: 3 warnings (opacity-50 used without pointer-events-none, unused var 'data')
✗ TypeScript: 2 errors
  - profile-form.tsx:47:12 - Type 'any' is not assignable...
  - stat-dialog.tsx:89:3 - Argument of type 'string' is not assignable to type 'StatId'

$ wc -l apps/cms/components/dashboard/profile-form.tsx
  347 apps/cms/components/dashboard/profile-form.tsx  ← GOD CLASS CANDIDATE
```

---

## Step 1: Deprecated Code Scan

```bash
$ bash deprecated-scanner.sh

--- apps/cms/components/dashboard/stat-card.tsx ---
  [No deprecated patterns found ✅]

--- apps/cms/components/dashboard/stat-dialog.tsx ---
  🟠 TypeScript: Line 34 — `any` type on `formData`
  🟠 TypeScript: Line 89 — Unsafe assertion `as string` without guard

--- packages/ui/components/profile-form.tsx ---
  🟡 React: Line 12 — React.FC type (discouraged)
```

---

## Step 2: Architecture Review

### ⚠️ GOD CLASS DETECTED: `profile-form.tsx` — 347 lines

**Responsibilities found:**
1. Fetching current Profile data
2. Managing name/bio/tagline fields
3. Managing social link fields
4. Managing stat entries (CRUD list)
5. Managing file upload (avatar)
6. Form submission + error handling
7. Dirty state tracking for the save button

**Recommendation**: Apply Composite Pattern

```
profile-form/
  index.ts                    (barrel export)
  profile-form.root.tsx       (~60 lines: owns FormProvider, submit logic)
  profile-form.bio.tsx        (~80 lines: name, bio, tagline fields)
  profile-form.links.tsx      (~70 lines: social links with mini CRUD)
  profile-form.stats.tsx      (~80 lines: stat list, delegates to StatDialog)
  profile-form.avatar.tsx     (~60 lines: file upload, Appwrite storage)
```

---

## Step 3: Findings Report

```markdown
# Code Review — Dashboard Section / Stat Cards
Date: 2026-04-12
Files: 3 changed (+187 / -23)

## Executive Summary
The stat card and dialog implementations are functionally correct but have 
type safety violations and a God Class issue in profile-form.tsx. The deprecated 
React.FC usage is minor. No security issues found. Test coverage is missing 
for StatDialog.  
**Verdict: CONDITIONAL APPROVE — fix blocking issues before merge.**

## Deprecated Code
🟡 profile-form.tsx:12 — `React.FC` (discouraged) → explicit return type
🟠 stat-dialog.tsx:34 — `any` type on formData → z.infer<typeof StatSchema>
🟠 stat-dialog.tsx:89 — unsafe `as string` → Branded StatId + type guard

## Architecture Issues
[BLOCKING] profile-form.tsx — God Class (347 lines, 7 responsibilities)
  → Decompose using Composite Pattern (see proposed structure above)

## Security Issues
✅ No security issues found.

## Performance Issues
[WARNING] stat-dialog.tsx:104 — Dialog opens with no Suspense fallback
  → Add <Suspense fallback={<DialogSkeleton />}> around async content

## Code Quality
[WARNING] profile-form.tsx:156 — Magic number `500` (debounce delay)
  → Extract: const SAVE_DEBOUNCE_MS = 500;
[INFO] stat-card.tsx:23 — Variable `d` should be `data` (naming)

## Type Safety
[BLOCKING] profile-form.tsx:47 — `any` type on API response → typed Zod schema
[BLOCKING] stat-dialog.tsx:89 — missing Branded StatId type

## Test Coverage
[BLOCKING] StatDialog — no test file found
  → Required: create/edit/delete paths, error state, validation display

## Action Items
### BLOCKING
- [ ] Decompose profile-form.tsx (God Class)
- [ ] Remove all `any` types — add Zod schemas
- [ ] Add StatDialog tests

### HIGH
- [ ] Add Suspense boundary to StatDialog
- [ ] Replace unsafe `as string` with Branded type

### BACKLOG
- [ ] Remove React.FC from profile-form.tsx
- [ ] Name debounce constant
```

---

## Step 4: Fix Collaboration

**Finding: `any` type on formData (BLOCKING)**

```typescript
// ❌ CURRENT (stat-dialog.tsx:34)
const [formData, setFormData] = useState<any>({});

// ✅ REQUIRED FIX
const StatFormSchema = z.object({
  label: z.string().min(1).regex(/^[a-zA-Z]/, 'Label must start with a letter'),
  value: z.string().min(1),
  icon: z.string().optional(),
});
type StatFormData = z.infer<typeof StatFormSchema>;

const [formData, setFormData] = useState<Partial<StatFormData>>({});
```

**Finding: God Class profile-form.tsx (BLOCKING)**

```typescript
// ✅ ROOT COMPONENT (~60 lines)
export const ProfileForm = () => {
  const form = useForm<ProfileFormData>({ resolver: zodResolver(ProfileSchema) });
  const { mutate: saveProfile, isPending } = useSaveProfile();

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(data => saveProfile(data))}>
        <ProfileForm.Bio />
        <ProfileForm.Links />
        <ProfileForm.Stats />
        <ProfileForm.Avatar />
        <ProfileForm.Actions isPending={isPending} />
      </form>
    </FormProvider>
  );
};
```
