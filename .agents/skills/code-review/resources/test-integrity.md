# Test Integrity — Coverage Requirements & Quality Standards

---

## Coverage Requirements

These are minimums, not targets. Meeting them doesn't mean the tests are good.

| Code Type | Statement Coverage | Branch Coverage | Notes |
|:---|:---|:---|:---|
| Domain schemas (Zod) | 100% | 100% | Every validation rule tested |
| Server functions/mutations | 100% | 100% | Including error paths + permission matrix |
| Custom hooks | 90%+ | 80%+ | All state transitions |
| Utility functions | 100% | 100% | Pure functions = complete coverage |
| React components | 80%+ | 70%+ | Critical paths: render, interaction, error |
| Routes/loaders | 85%+ | 75%+ | Happy path + 404/auth failure |

**Zero coverage is never acceptable** for new code. If a unit of code was added in this diff, it must have tests.

---

## Test Quality Anti-Patterns

### Anti-Pattern 1: Testing Implementation Details

```typescript
// ❌ POOR: Testing internal state (breaks on refactoring)
it('sets isLoading to true initially', () => {
  const { result } = renderHook(() => useSkills());
  expect(result.current.isLoading).toBe(true); // Testing internals
});

// ✅ GOOD: Testing behavior from the user's perspective
it('shows a loading skeleton while fetching skills', () => {
  render(<SkillsList />);
  expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
});
```

---

### Anti-Pattern 2: `toBeTruthy` / `toBeFalsy` Assertions

```typescript
// ❌ POOR: Too vague — what are we actually asserting?
expect(result).toBeTruthy();
expect(error).toBeFalsy();

// ✅ GOOD: Specific assertions that describe intent
expect(result).toEqual({ id: 'abc', name: 'TypeScript' });
expect(error).toBeNull();
expect(screen.getByText('Skill saved successfully')).toBeVisible();
```

---

### Anti-Pattern 3: Shared State Between Tests

```typescript
// ❌ POOR: Tests share state — order-dependent failures
let db: Database;
beforeAll(() => { db = new Database(); });

test('test 1 inserts data', () => db.insert(item));
test('test 2 reads data', () => expect(db.all()).toHaveLength(1)); // Depends on test 1!

// ✅ GOOD: Each test sets up its own state
beforeEach(() => { db = new Database(); }); // Fresh state for every test
test('test 2 reads data', () => {
  db.insert(item);
  expect(db.all()).toHaveLength(1);
});
```

---

### Anti-Pattern 4: Over-Mocking (Mock Everything)

```typescript
// ❌ POOR: Mocking so much that the test doesn't test anything real
jest.mock('../auth');
jest.mock('../database');
jest.mock('../validation');
jest.mock('../notifications');
// What is this test even verifying at this point?

// ✅ GOOD: Mock at the API boundary only
// Mock: external services (Appwrite, fetch) — things outside our control
// Don't mock: business logic, validation, transformations — these are what we're testing
```

---

### Anti-Pattern 5: `fireEvent` Instead of `userEvent`

```typescript
// ❌ POOR: fireEvent doesn't simulate real user interactions
import { fireEvent } from '@testing-library/react';
fireEvent.click(button);

// ✅ GOOD: userEvent simulates full, realistic browser interactions
import userEvent from '@testing-library/user-event';
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'Hello World');
await user.keyboard('{Enter}');
```

---

### Anti-Pattern 6: Non-Descriptive Test Names

```typescript
// ❌ POOR: What does "works" mean? What scenario?
it('works', () => { ... });
it('test 1', () => { ... });
it('submit form', () => { ... });

// ✅ GOOD: Test names that describe behavior + condition
it('disables the save button when the form is invalid', () => { ... });
it('shows a success toast after a valid skill is saved', () => { ... });
it('rolls back the optimistic update when the mutation fails', () => { ... });
// Pattern: "it [behavior] when [condition]"
```

---

## Required Test Categories

### For Every New Schema

```typescript
describe('SkillSchema', () => {
  describe('valid cases', () => {
    it('accepts a complete, valid skill', () => {
      const result = SkillSchema.safeParse({ name: 'TypeScript', level: 8, category: 'frontend' });
      expect(result.success).toBe(true);
    });
    it('accepts a skill with optional icon omitted', () => { ... });
  });

  describe('invalid cases', () => {
    it('rejects when name is empty', () => {
      const result = SkillSchema.safeParse({ name: '', level: 5, category: 'frontend' });
      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors.name).toContain('Name required');
    });
    it('rejects when name starts with a number', () => { ... });
    it('rejects when level is less than 1', () => { ... });
    it('rejects when level is greater than 10', () => { ... });
    it('rejects when category is not in the enum', () => { ... });
  });
});
```

### For Every Server Function / Mutation

```typescript
describe('deleteSkillFn', () => {
  it('deletes the document when the owner calls it', async () => { ... });
  it('throws Forbidden when a non-owner calls it', async () => { ... });
  it('throws Unauthorized when unauthenticated user calls it', async () => { ... });
  it('throws Not Found when the skill ID does not exist', async () => { ... });
  it('invalidates the skills query cache after deletion', async () => { ... });
});
```

### For Every React Component (Critical Paths)

```typescript
describe('SkillCard', () => {
  it('renders the skill name and level', () => { ... });
  it('shows the edit button when user is the owner', () => { ... });
  it('hides the edit button when user is not the owner', () => { ... });
  it('opens the edit dialog when the edit button is clicked', async () => { ... });
  it('shows the delete confirmation when delete is triggered', async () => { ... });
});
```

---

## Test Coverage Scanner

```bash
echo "=== TEST COVERAGE ANALYSIS ==="

# Quick coverage check
pnpm test:coverage --reporter=text 2>&1 | tail -30

# Find source files without corresponding test files
echo "\n[Files Missing Tests]"
find src -name "*.ts" -o -name "*.tsx" | \
  grep -v ".test." | grep -v ".spec." | grep -v node_modules | \
  while read f; do
    base="${f%.ts}"
    base="${base%.tsx}"
    if [ ! -f "${base}.test.ts" ] && [ ! -f "${base}.test.tsx" ] && \
       [ ! -f "${base}.spec.ts" ] && [ ! -f "${base}.spec.tsx" ]; then
      # Check if it's testable code (not just type files or barrel exports)
      lines=$(wc -l < "$f")
      if [ "$lines" -gt 10 ]; then
        echo "  ⚠️  $f — no test file found"
      fi
    fi
  done

# Check for weak assertions in existing tests
echo "\n[Weak Assertions - toBeTruthy/toBeFalsy]"
grep -rn "toBeTruthy\|toBeFalsy" . --include="*.test.*" | grep -v node_modules | \
  sed 's/^/  ⚠️  /'

# Check for overmocking
echo "\n[Heavy Mocking - may be overtesting]"
grep -rn "jest\.mock\|vi\.mock" . --include="*.test.*" | grep -v node_modules | \
  awk -F: '{print $1}' | sort | uniq -c | sort -rn | head -10 | \
  awk '$1 > 3 {print "  ⚠️  " $2 " has " $1 " mocks — review"}'

echo "\n=== END COVERAGE ANALYSIS ==="
```
