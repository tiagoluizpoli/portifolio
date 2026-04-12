# Example: Bug Fix Session — Root Cause Investigation + Atomic Fix

**Scenario**: Users report that the "Save Changes" button stays disabled even after making edits to the profile form. Investigate, fix, and commit properly.

---

## Step 0: Pre-Fix Setup

```bash
$ git status
On branch main
nothing to commit, working tree clean

$ git log --oneline -5
3c4d5e6 feat(profile): add avatar upload to ProfileForm
2b3c4d5 refactor(profile): decompose ProfileForm into Composite components
1a2b3c4 test(profile): add integration tests for ProfileForm submit flow
0z9y8x7 feat(auth): add session refresh on token expiry

# Safety stash created before any changes
$ git stash push -m "Safety backup: 2026-04-12 15:45:00"
$ git stash apply stash@{0}
```

---

## Step 1: Reproduce and Diagnose

```bash
# Read the relevant diff to understand the component's dirty state logic
$ git diff 2b3c4d5..3c4d5e6 -- apps/web/src/features/profile/components/
```

Findings from the diff:
- `ProfileForm.Root.tsx` tracks dirty state via `form.formState.isDirty`
- The `CmsSaveButton` receives `disabled={!isDirty || !isValid}`
- `ProfileForm.Avatar.tsx` uploads immediately on file select — it doesn't write to the form state
- **Root cause**: Avatar upload is not a form field — it's a side-effect action that writes directly to Appwrite storage. The form never detects it as a "change" because `react-hook-form` doesn't know about it.

```bash
# Verify root cause matches symptoms
# Avatar change → form.formState.isDirty stays false → CmsSaveButton disabled
# All other field changes → form.formState.isDirty = true → button enabled ✅
```

---

## Step 2: Fix Implementation

**Decision**: Introduce a separate `avatarChanged` boolean state in `ProfileForm.Root`. When the avatar upload completes, set it to `true`. The save button disables only if `!isDirty && !avatarChanged`.

```bash
# Files changed:
# - ProfileForm.Root.tsx (add avatarChanged state + pass setter to Avatar)
# - ProfileForm.Avatar.tsx (call onAvatarChange callback after upload)
# - ProfileForm.Actions.tsx (use avatarChanged in disabled prop)

$ pnpm guard
✓ All checks pass

$ pnpm test
✓ 52 tests passed
```

---

## Step 3: Commit the Fix

```bash
$ git diff HEAD
# Review the full diff — 3 files, clean changes

$ git add \
  apps/web/src/features/profile/components/ProfileForm/ProfileForm.Root.tsx \
  apps/web/src/features/profile/components/ProfileForm/ProfileForm.Avatar.tsx \
  apps/web/src/features/profile/components/ProfileForm/ProfileForm.Actions.tsx

$ git diff --cached
# Verify: exactly the avatar change tracking changes are staged

$ git commit -m "fix(profile): track avatar upload as dirty state to enable save button

Avatar changes are not tracked by react-hook-form since the upload
is a side-effect (writes to storage, not a form field value).

Added avatarChanged boolean state in ProfileForm.Root:
- Set to true after successful avatar upload in ProfileForm.Avatar
- Reset to false after successful form submission in ProfileForm.Root
- ProfileForm.Actions reads (isDirty || avatarChanged) for disabled prop

Closes #204"
```

---

## Step 4: Add a Regression Test

```bash
# Created: apps/web/src/features/profile/__tests__/ProfileForm.save-button.test.tsx
# Tests:
# - Save button disabled on mount (no changes)
# - Save button enabled after typing in a field
# - Save button enabled after avatar upload (the bug case)
# - Save button disabled again after successful save

$ pnpm test
✓ 56 tests passed (52 existing + 4 new)

$ pnpm guard
✓ All checks pass

$ git add apps/web/src/features/profile/__tests__/ProfileForm.save-button.test.tsx
$ git commit -m "test(profile): add regression test for save button disabled state

Covers the avatar-upload dirty state bug (fixed in previous commit)
and all other field change scenarios affecting the save button."
```

---

## Step 5: Session Close

```bash
$ git log --oneline -4
7g8h9i0 test(profile): add regression test for save button disabled state
6f7g8h9 fix(profile): track avatar upload as dirty state to enable save button
3c4d5e6 feat(profile): add avatar upload to ProfileForm          ← pre-session
2b3c4d5 refactor(profile): decompose ProfileForm into Composite components

$ git stash list
stash@{0}: On main: Safety backup: 2026-04-12 15:45:00
```

> **Session complete. 2 commits created:**
> - `fix(profile): track avatar upload as dirty state to enable save button`
> - `test(profile): add regression test for save button disabled state`
>
> The fix is atomic — only the relevant 3 files. The regression test is a separate commit so `git bisect` can isolate either commit independently.
>
> **Safety stash** `stash@{0}` is available. Drop or keep?

---

## Key Principles Demonstrated

1. **Read before writing** — reviewed the diff to understand the architecture before touching code
2. **Root cause precision** — the commit message explains *why* (react-hook-form doesn't know about storage uploads), not just *what* changed
3. **Test follows fix** — the regression test is a separate commit (fix then test, not mixed)
4. **Issue reference** — `Closes #204` creates a permanent link between code and bug report
5. **Guard at every checkpoint** — no "I'll fix lint later" tolerance
