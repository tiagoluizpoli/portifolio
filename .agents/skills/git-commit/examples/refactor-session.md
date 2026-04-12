# Example: Refactor Session — Splitting a God Class

**Scenario**: A `ProfileForm.tsx` file has grown to 380 lines with 7 responsibilities. Time to decompose it using the Composite Pattern, creating atomic commits at each stage of the refactor.

---

## Pre-Session Analysis

```bash
$ git status
On branch refactor/profile-form
nothing to commit, working tree clean

$ wc -l apps/web/src/features/profile/components/ProfileForm.tsx
380 apps/web/src/features/profile/components/ProfileForm.tsx

# Identify the 7 responsibilities in the existing component:
# 1. Fetching current profile data
# 2. Bio / tagline / location fields
# 3. Social links CRUD mini-list
# 4. Stats/metrics CRUD mini-list
# 5. Avatar file upload
# 6. Form submission + error handling
# 7. Dirty state tracking for save/discard buttons
```

---

## Step 0: Safety First

```bash
$ git stash push -m "Safety backup: 2026-04-12 14:00:00"
$ git stash apply stash@{0}
$ git status  # Verify clean
```

---

## Step 1: Create the New File Structure (no behavior change)

First commit establishes the directory structure and barrel export.

```bash
# Created:
# features/profile/components/ProfileForm/
#   ProfileForm.Root.tsx      (empty shell — just renders children)
#   ProfileForm.Bio.tsx       (empty shell)
#   ProfileForm.Links.tsx     (empty shell)
#   ProfileForm.Stats.tsx     (empty shell)
#   ProfileForm.Avatar.tsx    (empty shell)
#   ProfileForm.Actions.tsx   (empty shell)
#   index.ts                  (barrel: export { ProfileForm } from './ProfileForm.Root')

$ pnpm guard
✓ All checks pass

$ git add apps/web/src/features/profile/components/ProfileForm/
$ git commit -m "refactor(profile): scaffold Composite sub-component directory structure"
```

---

## Step 2: Migrate Bio Fields (zero visual regression)

```bash
# Moved bio/tagline/location fields into ProfileForm.Bio.tsx
# ProfileForm.Root imports and renders <ProfileForm.Bio />
# ProfileForm.tsx (old file) still exists, still works

$ pnpm guard
✓ All checks pass

$ pnpm test
✓ 52 tests passed

$ git add apps/web/src/features/profile/components/ProfileForm/
$ git commit -m "refactor(profile): migrate bio/tagline/location fields into ProfileForm.Bio"
```

---

## Step 3: Migrate Social Links

```bash
$ pnpm guard
✓ All checks pass

$ git add apps/web/src/features/profile/components/ProfileForm/ProfileForm.Links.tsx
$ git commit -m "refactor(profile): migrate social links CRUD into ProfileForm.Links"
```

---

## Step 4: Migrate Stats

```bash
$ pnpm guard
✓ All checks pass

$ git add apps/web/src/features/profile/components/ProfileForm/ProfileForm.Stats.tsx
$ git commit -m "refactor(profile): migrate metrics list into ProfileForm.Stats"
```

---

## Step 5: Migrate Avatar Upload

```bash
$ pnpm guard
✓ All checks pass

$ git add apps/web/src/features/profile/components/ProfileForm/ProfileForm.Avatar.tsx
$ git commit -m "refactor(profile): migrate avatar upload logic into ProfileForm.Avatar"
```

---

## Step 6: Migrate Actions + Root Form Logic

```bash
$ pnpm guard
✓ All checks pass

$ git add \
  apps/web/src/features/profile/components/ProfileForm/ProfileForm.Root.tsx \
  apps/web/src/features/profile/components/ProfileForm/ProfileForm.Actions.tsx
$ git commit -m "refactor(profile): migrate form submission and dirty state into Root and Actions"
```

---

## Step 7: Delete the Old Monolithic File

```bash
# Remove ProfileForm.tsx (the old 380-line god class)
$ rm apps/web/src/features/profile/components/ProfileForm.tsx

# Update any imports that pointed to the old file
# (barrel index.ts now exports from ProfileForm/index.ts)

$ pnpm guard
✓ All checks pass

$ pnpm test
✓ 52 tests passed  # Same number — no regressions

$ git add -A  # Captures the deletion
$ git commit -m "refactor(profile): remove monolithic ProfileForm.tsx — replaced by Composite"
```

---

## Step 8: Verify Line Counts

```bash
$ wc -l apps/web/src/features/profile/components/ProfileForm/*.tsx
  58 ProfileForm.Actions.tsx
  72 ProfileForm.Avatar.tsx
  84 ProfileForm.Bio.tsx
  67 ProfileForm.Links.tsx
  63 ProfileForm.Root.tsx
  77 ProfileForm.Stats.tsx
 10 index.ts
 431 total   # More total lines (more explicit), but each file is under 100

$ git log --oneline -8
f8e9a00 refactor(profile): remove monolithic ProfileForm.tsx — replaced by Composite
e7f8g99 refactor(profile): migrate form submission and dirty state into Root and Actions
d6e7f88 refactor(profile): migrate avatar upload logic into ProfileForm.Avatar
c5d6e77 refactor(profile): migrate metrics list into ProfileForm.Stats
b4c5d66 refactor(profile): migrate social links CRUD into ProfileForm.Links
a3b4c55 refactor(profile): migrate bio/tagline/location fields into ProfileForm.Bio
9f2a3b4 refactor(profile): scaffold Composite sub-component directory structure
8e1f2a3 chore(deps): previous commit before session
```

---

## Key Principles Demonstrated

1. **Each commit is a safe stopping point** — the app works at every step
2. **Migrate one responsibility at a time** — progress is visible and reversible
3. **Never mix refactor with behavior changes** — pure structural moves only
4. **Guard passes at every step** — no "I'll fix it later" shortcuts
5. **Delete only after everything is migrated** — safety before cleanup
