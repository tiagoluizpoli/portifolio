# Example: Feature Session — End-to-End New Feature

**Scenario**: Implementing a new "Tags" feature end-to-end: Appwrite collection, server functions, UI component, and tests. All from a single development session.

---

## Step 0: Pre-Session Setup

```bash
$ git status
On branch feat/tags
nothing to commit, working tree clean

$ git log --oneline -5
a2b3c4d chore(deps): update node-appwrite to 22.1.3
f1e2d3c feat(auth): add team-based role on signup
98b7a6e fix(dashboard): resolve stale data after filter change
7d6c5b4 refactor(api): centralize AppwriteException handling
3e4f5g6 test(auth): add E2E session persistence tests

# Safety stash created (nothing to stash yet — clean state)
# Session begins: implement tags feature
```

---

## Step 1: After Implementing the DB Schema

```bash
$ git diff --name-only HEAD
packages/db/schema.ts
packages/db/migrations/004-add-tags-collection.ts
```

```bash
$ pnpm guard
✓ Lint: 0 errors
✓ TypeScript: 0 errors  
✓ Tests: 47 passed

# Quality gate passes. Proceed.
```

```bash
$ git stash push -m "Safety backup: 2026-04-12 10:30:00"
$ git stash apply stash@{0}
$ git status  # Verify restored

$ git add packages/db/schema.ts packages/db/migrations/004-add-tags-collection.ts
$ git diff --cached --stat
 packages/db/migrations/004-add-tags-collection.ts | 34 ++
 packages/db/schema.ts                             | 18 +-
 2 files changed, 48 insertions(+), 4 deletions(-)

$ git commit -m "feat(db): add tags collection with name, slug, and color attributes"
[feat/tags 3a4b5c6] feat(db): add tags collection with name, slug, and color attributes
```

---

## Step 2: After Implementing Server Functions

```bash
$ git diff --name-only HEAD
apps/web/src/server/tags.functions.ts
apps/web/src/server/tags.queries.ts
```

```bash
$ pnpm guard
✓ All checks pass

$ git add apps/web/src/server/tags.functions.ts apps/web/src/server/tags.queries.ts
$ git diff --cached
# Review — confirms: createTag, updateTag, deleteTag, listTags, getTag

$ git commit -m "feat(tags): implement CRUD server functions with Zod validation"
[feat/tags 4b5c6d7] feat(tags): implement CRUD server functions with Zod validation
```

---

## Step 3: After Implementing UI Components

```bash
$ git diff --name-only HEAD
apps/web/src/features/tags/components/TagBadge.tsx
apps/web/src/features/tags/components/TagPicker.tsx
apps/web/src/features/tags/components/TagManager.tsx
apps/web/src/features/tags/hooks/useTags.ts
apps/web/src/features/tags/index.ts
```

```bash
$ pnpm guard
✓ All checks pass

$ git add apps/web/src/features/tags/
$ git commit -m "feat(tags): add TagBadge, TagPicker, and TagManager components"
```

---

## Step 4: Integrating into Existing Feature

```bash
$ git diff --name-only HEAD
apps/web/src/features/posts/components/PostForm.tsx   # Added TagPicker here
apps/web/src/features/posts/routes/post.route.tsx     # Loads tags in loader
```

```bash
$ pnpm guard
✓ All checks pass

$ git add apps/web/src/features/posts/
$ git commit -m "feat(posts): integrate TagPicker into post creation form"
```

---

## Step 5: Tests

```bash
$ git diff --name-only HEAD
apps/web/src/features/tags/__tests__/tags.functions.test.ts
apps/web/src/features/tags/__tests__/TagBadge.test.tsx
apps/web/src/features/tags/__tests__/TagPicker.test.tsx
e2e/tags/tag-management.spec.ts
```

```bash
$ pnpm test
✓ 73 tests passed (47 existing + 26 new)

$ pnpm guard
✓ All checks pass

$ git add apps/web/src/features/tags/__tests__/
$ git commit -m "test(tags): add unit and RTL tests for tag components and functions"

$ git add e2e/tags/
$ git commit -m "test(tags): add E2E tests for full tag management flow"
```

---

## Session Close

```bash
$ git log --oneline -7
9c0d1e2 test(tags): add E2E tests for full tag management flow
8b9c0d1 test(tags): add unit and RTL tests for tag components and functions
7a8b9c0 feat(posts): integrate TagPicker into post creation form
6f7a8b9 feat(tags): add TagBadge, TagPicker, and TagManager components
5e6f7a8 feat(tags): implement CRUD server functions with Zod validation
4d5e6f7 feat(db): add tags collection with name, slug, and color attributes
a2b3c4d chore(deps): update node-appwrite to 22.1.3  ← last pre-session commit

$ git stash list
stash@{0}: On feat/tags: Safety backup: 2026-04-12 10:30:00
```

> **Session complete. 6 commits created:**
> - `feat(db): add tags collection with name, slug, and color attributes`
> - `feat(tags): implement CRUD server functions with Zod validation`
> - `feat(tags): add TagBadge, TagPicker, and TagManager components`
> - `feat(posts): integrate TagPicker into post creation form`
> - `test(tags): add unit and RTL tests for tag components and functions`
> - `test(tags): add E2E tests for full tag management flow`
>
> **Safety stash** `stash@{0}` is available. Drop or keep?
