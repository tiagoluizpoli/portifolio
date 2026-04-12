# Example: Monorepo Session — Changes Across Multiple Packages

**Scenario**: Implementing a shared `useInfiniteScroll` hook that's used in `apps/web` and exported from `packages/ui-lib`. Plus, a dependent API change in `packages/api`.

This session demonstrates correct scoping across multiple packages in a pnpm workspace monorepo.

---

## Workspace Structure

```
monorepo/
├── apps/
│   └── web/                    # Main web application
│       └── src/
│           └── features/
│               └── posts/
│                   └── components/PostList.tsx
├── packages/
│   ├── ui-lib/                 # Shared component library
│   │   └── src/
│   │       ├── hooks/useInfiniteScroll.ts  ← NEW
│   │       └── index.ts
│   └── api/                    # API package (server functions)
│       └── src/
│           └── posts.functions.ts          ← MODIFIED
```

---

## Step 0: Pre-Session Setup

```bash
$ git status
On branch feat/infinite-scroll
nothing to commit, working tree clean

$ git log --oneline -5
a1b2c3d chore(deps): update @tanstack/react-virtual
9z8y7x6 feat(posts): add FilterBar to posts list
8y7x6w5 fix(api): handle empty query array in Appwrite call
...

$ git stash push -m "Safety backup: 2026-04-12 11:30:00"
$ git stash apply stash@{0}
```

---

## Step 1: API Layer — Add Cursor Pagination Support

The API needs cursor-based pagination instead of offset for infinite scroll.

```bash
# Modified: packages/api/src/posts.functions.ts
# - Added 'cursor' parameter to listPosts
# - Returns 'nextCursor' in response alongside documents

$ pnpm guard
✓ All checks pass

$ git add packages/api/src/posts.functions.ts
$ git diff --cached --stat
 packages/api/src/posts.functions.ts | 28 +++--
 1 file changed, 20 insertions(+), 8 deletions(-)

$ git commit -m "feat(api): add cursor-based pagination to listPosts server function

Changed listPosts to accept optional 'cursor' parameter (last document
ID). Returns 'nextCursor' field alongside documents to enable infinite
scroll without offset gaps caused by real-time inserts/deletes."
```

---

## Step 2: Shared Hook — `useInfiniteScroll` in `ui-lib`

```bash
# Created: packages/ui-lib/src/hooks/useInfiniteScroll.ts
# Modified: packages/ui-lib/src/index.ts (added export)

$ pnpm guard
✓ All checks pass

$ pnpm --filter ui-lib test
✓ 12 tests passed (10 existing + 2 new hook tests)

$ git add packages/ui-lib/src/hooks/useInfiniteScroll.ts packages/ui-lib/src/index.ts
$ git diff --cached --stat
 packages/ui-lib/src/hooks/useInfiniteScroll.ts | 84 +++++++
 packages/ui-lib/src/index.ts                   |  3 +
 2 files changed, 87 insertions(+)

$ git commit -m "feat(ui-lib): add useInfiniteScroll hook with IntersectionObserver

Generic hook that uses IntersectionObserver to detect scroll position
and calls 'loadMore()' when the sentinel element enters the viewport.
Returns: { sentinelRef, isLoading, hasMore }"
```

---

## Step 3: Consumer — Wire into PostList

```bash
# Modified: apps/web/src/features/posts/components/PostList.tsx
# - Uses useInfiniteScroll from ui-lib
# - Passes nextCursor from each page to load next batch
# - Renders sentinel <div> at bottom for observer

$ pnpm guard
✓ All checks pass

$ git add apps/web/src/features/posts/components/PostList.tsx
$ git diff --cached --stat
 apps/web/src/features/posts/components/PostList.tsx | 47 +++--
 1 file changed, 35 insertions(+), 12 deletions(-)

$ git commit -m "feat(posts): integrate infinite scroll into PostList component

Uses useInfiniteScroll from ui-lib with cursor pagination from
updated listPosts API. Replaces the previous 'Load More' button
with auto-loading via IntersectionObserver sentinel element."
```

---

## Step 4: Query Layer — Add Infinite Query

```bash
# Modified: apps/web/src/features/posts/hooks/usePosts.ts
# - Migrated from useQuery to useInfiniteQuery
# - pageParam maps to cursor
# - getNextPageParam returns nextCursor from each response

$ pnpm guard
✓ All checks pass

$ git add apps/web/src/features/posts/hooks/usePosts.ts
$ git commit -m "feat(posts): migrate usePosts to useInfiniteQuery for cursor pagination"
```

---

## Step 5: Tests

```bash
# Created:
# packages/ui-lib/src/hooks/__tests__/useInfiniteScroll.test.ts
# apps/web/src/features/posts/__tests__/PostList.infinite.test.tsx

$ pnpm test
✓ 81 tests passed (67 existing + 14 new)
$ pnpm guard
✓ All checks pass

$ git add packages/ui-lib/src/hooks/__tests__/
$ git commit -m "test(ui-lib): add unit tests for useInfiniteScroll hook"

$ git add apps/web/src/features/posts/__tests__/PostList.infinite.test.tsx
$ git commit -m "test(posts): add RTL tests for PostList infinite scroll behavior"
```

---

## Session Close

```bash
$ git log --oneline -7
f6g7h8i test(posts): add RTL tests for PostList infinite scroll behavior
e5f6g7h test(ui-lib): add unit tests for useInfiniteScroll hook
d4e5f6g feat(posts): migrate usePosts to useInfiniteQuery for cursor pagination
c3d4e5f feat(posts): integrate infinite scroll into PostList component
b2c3d4e feat(ui-lib): add useInfiniteScroll hook with IntersectionObserver
a1b2c3d feat(api): add cursor-based pagination to listPosts server function
9z8y7x6 feat(posts): add FilterBar to posts list   ← pre-session

$ git stash list
stash@{0}: On feat/infinite-scroll: Safety backup: 2026-04-12 11:30:00
```

> **Session complete. 6 commits created:**
> - `feat(api)` — cursor pagination in the API layer
> - `feat(ui-lib)` — shared hook in the component library
> - `feat(posts)` × 2 — wired into consumer (component + query)
> - `test(ui-lib)` — hook unit tests
> - `test(posts)` — consumer integration tests
>
> **Scoping discipline**: Each commit scope matches its package (`api`, `ui-lib`, `posts`).
> The commit history is a clear implementation story: API → Library → Consumer → Tests.
