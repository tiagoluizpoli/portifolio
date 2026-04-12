# Coverage Guide — Measuring, Interpreting, and Enforcing Test Quality

---

## Coverage Metrics Explained

Coverage tools report four metrics. Understanding what each actually means:

| Metric | What it measures | How to read it |
|:---|:---|:---|
| **Statement** | Were all statements executed? | Basic baseline — not sufficient alone |
| **Branch** | Were both sides of every `if/else` taken? | The most important metric |
| **Function** | Was every function called at least once? | Catches dead code and entry points |
| **Line** | Were all lines executed? | Similar to statement, often same % |

**Branch coverage is king.** A function with 95% statement coverage but 40% branch coverage has massive untested paths. Untested branches = undetected bugs.

---

## Reading the Coverage Report

```bash
pnpm test:coverage --reporter=text

# GOOD REPORT:
# File                          | Stmts | Branch | Funcs | Lines
# ------------------------------|-------|--------|-------|------
# src/schemas/item.schema.ts    | 100   | 100    | 100   | 100   ✅
# src/functions/item.fn.ts      | 95.2  | 88.5   | 100   | 95.1  ✅
# src/components/ItemCard.tsx   | 82.4  | 75.0   | 83.3  | 82.4  ✅

# CONCERNING REPORT:
# src/utils/permissions.ts      | 100   |  45.2  | 100   | 100   ❌ Branch!
# src/functions/auth.fn.ts      |  60.0 |  30.0  |  50.0 |  60.0 ❌ Everything!
# src/lib/retry.ts              |   0   |   0    |   0   |   0   ❌ ZERO coverage
```

---

## Thresholds by Code Type

```typescript
// vitest.config.ts — enforce thresholds per directory
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        // TIER 1: Core domain logic — highest standards
        // Zod schemas, business rules, validators
        'src/schemas/**': {
          statements: 100, branches: 100, functions: 100, lines: 100,
        },

        // TIER 2: Server functions / API layer
        // Every auth path, permission check, error handler must be tested
        'src/functions/**': {
          statements: 95, branches: 90, functions: 95, lines: 95,
        },

        // TIER 3: Utility functions (pure functions)
        // Should be fully testable with no mocking needed
        'src/utils/**': {
          statements: 95, branches: 90, functions: 95, lines: 95,
        },

        // TIER 4: React components
        // Critical paths: render, interaction, loading, error states
        'src/components/**': {
          statements: 80, branches: 75, functions: 80, lines: 80,
        },

        // TIER 5: Custom hooks
        'src/hooks/**': {
          statements: 85, branches: 80, functions: 85, lines: 85,
        },

        // Global fallback
        global: {
          statements: 80, branches: 75, functions: 80, lines: 80,
        },
      },
    },
  },
});
```

---

## Identifying Coverage Cold Spots

```bash
# Generate HTML report for visual analysis
pnpm test:coverage --reporter=html
open coverage/index.html

# In the HTML report:
# Red lines = never executed
# Yellow lines = partially covered (branch issue)
# Green lines = fully covered

# Command-line cold spot detection
pnpm test:coverage --reporter=json --reporter=text 2>&1 | \
  awk '/^---/{p=1} p && $2<80' | sort -t'|' -k2 -n | head -20
# Shows files sorted by lowest statement coverage
```

---

## The "False 100%" Problem

High coverage doesn't mean good tests. Watch for:

```typescript
// ❌ HIGH COVERAGE, LOW QUALITY: Test that only exercises the success path
it('creates an item', async () => {
  const result = await createItemFn({ data: validInput });
  expect(result).toBeDefined(); // ← Weak assertion — toBeDefined is almost always true

  // This test achieves 100% statement coverage
  // But NEVER tests:
  //   - What happens with invalid input
  //   - What happens when the database is down
  //   - What happens when the user is unauthorized
  //   - What the actual shape of the result is
});

// ✅ CORRECT: Tests that actually verify behavior
it('creates an item with the correct owner', async () => {
  const result = await createItemFn({ data: validInput });
  expect(result.ownerId).toBe(mockUser.$id); // Specific assertion
  expect(result.title).toBe(validInput.title);
  expect(result.$id).toMatch(/^[a-z0-9]+$/); // Validates ID format
});

it('rejects creation when user is not authenticated', async () => {
  vi.mocked(createSessionClient).mockReturnValue(mockUnauthorizedClient());
  await expect(createItemFn({ data: validInput })).rejects.toThrow();
});
```

---

## Coverage-Driven Test Discovery

When you see a coverage gap, use this process:

```bash
# 1. Find the uncovered branch
open coverage/index.html  # Navigate to the file with low branch coverage

# 2. Identify what the branch represents
# Example: coverage shows line 47 partially covered
# Line 47: if (existing.ownerId !== user.$id) throw new Error('Forbidden');
# The "throw" branch was never taken → need "non-owner tries to modify" test

# 3. Write the missing test
it('throws Forbidden when non-owner attempts update', async () => {
  vi.mocked(databases.getDocument).mockResolvedValueOnce(
    createMockItem({ ownerId: 'some-other-user' }) // Different from current user
  );
  await expect(updateItemFn({ data: { id: 'item-1', updates: {} } }))
    .rejects.toThrow('Forbidden');
});

# 4. Re-run coverage to verify the gap is closed
pnpm test:coverage
```

---

## Coverage in CI — Quality Gate

```yaml
# .github/workflows/ci.yml
- name: Run tests with coverage
  run: pnpm test:coverage

- name: Fail if coverage drops
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.statements.pct')
    echo "Statement coverage: $COVERAGE%"
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "❌ Coverage below 80% threshold"
      exit 1
    fi
```

---

## Coverage Anti-Patterns

```typescript
// ❌ DON'T: Istanbul ignore comments to bypass coverage
// Not a test — just hiding the gap
/* istanbul ignore next */
if (process.env.NODE_ENV === 'test') { ... }

// ❌ DON'T: Testing trivial getters just to hit 100%
class Config {
  get name() { return 'app'; } // Testing this adds zero value
}
it('returns the name', () => {
  expect(new Config().name).toBe('app'); // Meaningless test
});

// ❌ DON'T: Excluding too much from coverage
// vitest.config.ts:
exclude: [
  'src/**',  // excluding everything that's hard to test defeats the point
],

// ✅ DO: Exclude only files that genuinely can't be unit tested
exclude: [
  'src/main.tsx',           // App entry point
  'src/**/*.stories.*',     // Storybook stories
  'src/test-utils/**',      // Test helpers
  'src/types/**',           // Pure TypeScript types
],
```
