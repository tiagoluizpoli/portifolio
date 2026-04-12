# Vitest Patterns — Unit and Integration Testing Reference

---

## Test File Architecture

```
src/
├── functions/
│   ├── items.functions.ts
│   └── __tests__/
│       └── items.functions.test.ts    ← Backend unit tests
├── components/
│   ├── ItemCard.tsx
│   └── __tests__/
│       └── ItemCard.test.tsx          ← Component tests (use RTL)
├── schemas/
│   ├── item.schema.ts
│   └── __tests__/
│       └── item.schema.test.ts        ← Schema unit tests
└── utils/
    ├── format.ts
    └── __tests__/
        └── format.test.ts             ← Pure function tests
```

---

## Pattern 1: Module Mocking — The Correct Way

```typescript
// ❌ WRONG: vi.mock is auto-hoisted — this placement creates confusion
describe('ItemService', () => {
  vi.mock('../lib/database'); // This actually runs BEFORE the describe block
  it('tests something', () => { ... });
});

// ✅ CORRECT: vi.mock at the top of the file
vi.mock('../lib/appwrite', () => ({
  createSessionClient: vi.fn(),
}));
vi.mock('../lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ messageId: 'msg-123' }),
}));

import { createSessionClient } from '../lib/appwrite'; // Import AFTER mock declaration

describe('ItemService', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset between tests — CRITICAL
  });

  it('...', () => { ... });
});
```

---

## Pattern 2: Mock Factory Functions

```typescript
// Create rich, reusable mock factories
const createMockItem = (overrides: Partial<Item> = {}): Item => ({
  $id: `item-${Math.random().toString(36).slice(2)}`,
  $createdAt: '2024-01-01T00:00:00.000Z',
  $updatedAt: '2024-01-01T00:00:00.000Z',
  title: 'Test Item',
  content: 'Test content',
  status: 'published',
  ownerId: 'user-test-123',
  deletedAt: null,
  ...overrides,
});

const createMockUser = (overrides: Partial<AppwriteUser> = {}): AppwriteUser => ({
  $id: 'user-test-123',
  $createdAt: '2024-01-01T00:00:00.000Z',
  name: 'Test User',
  email: 'test@example.com',
  emailVerification: true,
  ...overrides,
});

// Usage:
const adminUser = createMockUser({ name: 'Admin User', $id: 'admin-user' });
const draftItem = createMockItem({ status: 'draft', ownerId: adminUser.$id });
```

---

## Pattern 3: Spies — Verifying Without Replacing

```typescript
// spy = wraps real implementation, lets you observe calls
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); // Suppress output

afterEach(() => {
  consoleSpy.mockRestore(); // Restore original after each test
});

it('logs an error when Appwrite fails', async () => {
  vi.mocked(createSessionClient).mockReturnValue({
    account: { get: vi.fn().mockRejectedValue(new Error('Appwrite down')) },
  });

  await expect(getItemFn({ data: { id: 'abc' } })).rejects.toThrow();
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Error]'), expect.any(Error));
});
```

---

## Pattern 4: Async Testing Patterns

```typescript
// ✅ Testing async success
it('resolves with the item when it exists', async () => {
  const mockItem = createMockItem();
  vi.mocked(databases.getDocument).mockResolvedValueOnce(mockItem);

  const result = await getItemFn({ data: { id: mockItem.$id } });
  expect(result).toEqual(expect.objectContaining({ title: mockItem.title }));
});

// ✅ Testing async rejection
it('rejects when item is not found', async () => {
  vi.mocked(databases.getDocument).mockRejectedValueOnce(
    new AppwriteException('Not Found', 404, 'document_not_found', '')
  );

  await expect(getItemFn({ data: { id: 'nonexistent' } })).rejects.toThrow('not found');
});

// ✅ Testing sequential calls
it('calls delete only after successful archive', async () => {
  const archiveFn = vi.fn().mockResolvedValue({ success: true });
  const deleteFn = vi.fn().mockResolvedValue({});

  await archiveAndDeleteFn(archiveFn, deleteFn, 'item-123');

  expect(archiveFn).toHaveBeenCalledBefore(deleteFn); // vitest-extended
  expect(deleteFn).toHaveBeenCalledTimes(1);
});

// ✅ Testing that a function is NOT called
it('does not call the database when validation fails', async () => {
  const mockCreateDocument = vi.fn();
  vi.mocked(databases.createDocument).mockImplementation(mockCreateDocument);

  try {
    await createItemFn({ data: { title: '' } }); // Empty title fails Zod
  } catch {}

  expect(mockCreateDocument).not.toHaveBeenCalled();
});
```

---

## Pattern 5: Timer and Date Mocking

```typescript
// Fixed date — for consistent date-dependent tests
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

it('sets deletedAt to the current timestamp', async () => {
  await softDeleteItemFn({ data: { id: 'item-123' } });

  expect(databases.updateDocument).toHaveBeenCalledWith(
    expect.any(String), expect.any(String), 'item-123',
    expect.objectContaining({
      deletedAt: '2024-06-15T12:00:00.000Z', // Exactly the mocked time
    })
  );
});

// Advancing timers for debounce/timeout tests
it('triggers save after 500ms debounce', async () => {
  const save = vi.fn();
  const debouncedSave = debounce(save, 500);

  debouncedSave('data');
  expect(save).not.toHaveBeenCalled(); // Not yet

  vi.advanceTimersByTime(500);
  expect(save).toHaveBeenCalledWith('data'); // Now
});
```

---

## Pattern 6: Parameterized Tests (Test.each)

```typescript
// Test multiple inputs without duplicating test logic

const INVALID_TITLES = [
  ['empty string', ''],
  ['only spaces', '   '],
  ['starts with number', '123 Item'],
  ['starts with special char', '-Item'],
  ['exceeds max length', 'A'.repeat(256)],
];

it.each(INVALID_TITLES)('rejects title: %s (%s)', async (_caseName, title) => {
  const result = ItemSchema.safeParse({ title, status: 'draft' });
  expect(result.success).toBe(false);
});

const VALID_STATUSES = ['draft', 'published', 'archived'] as const;
it.each(VALID_STATUSES)('accepts status: %s', (status) => {
  const result = ItemSchema.safeParse({ title: 'Valid Title', status });
  expect(result.success).toBe(true);
});
```

---

## Pattern 7: Testing Hooks with renderHook

```typescript
import { renderHook, act } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useToggle', () => {
  it('starts false and toggles to true', () => {
    const { result } = renderHook(() => useToggle(false), { wrapper });
    expect(result.current.value).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.value).toBe(true);
  });

  it('resets to initial value', () => {
    const { result } = renderHook(() => useToggle(true), { wrapper });
    act(() => result.current.toggle());
    expect(result.current.value).toBe(false);

    act(() => result.current.reset());
    expect(result.current.value).toBe(true);
  });
});
```

---

## Pattern 8: Snapshot Testing (Use Sparingly)

```typescript
// ✅ Good use: stable, intentional output (serialized structures)
it('produces correct query object for filtered list', () => {
  const queries = buildItemQueries({ status: 'published', limit: 10 });
  expect(queries).toMatchSnapshot();
  // First run: creates snapshot
  // Later runs: detects unexpected changes
});

// ❌ Bad use: component snapshots (fragile — breaks on any UI change)
// Prefer: explicit assertions about what matters
it('renders the item title', () => {
  render(<ItemCard item={mockItem} />);
  expect(screen.getByText(mockItem.title)).toBeInTheDocument();
  // Don't: expect(container).toMatchSnapshot()
});
```

---

## Vitest Config Reference

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',     // Faster than jsdom for most tests
    globals: true,                // describe, it, expect without imports
    setupFiles: ['./src/test-setup.ts'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.*',
        'src/**/*.spec.*',
        'src/test-utils/**',
        'src/**/*.stories.*',
      ],
    },
  },
});

// src/test-setup.ts — runs before every test file
import '@testing-library/jest-dom/vitest'; // RTL matchers
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup()); // Clean up DOM after each test
```
