# Rebase Cookbook — Interactive Rebase Recipes & Safety Rules

Interactive rebase is the most powerful tool for writing clean git history. It lets you rewrite local commits before they reach shared branches. Used correctly, it transforms a messy "I was figuring things out" log into a clean, readable engineering narrative.

---

## The Prime Directive

> **Never rebase commits that exist on a shared remote branch.**

Rebase rewrites commit SHAs. If someone else has pulled those commits, your rebase will diverge the histories and create merge hell. The rule is absolute:

- ✅ Rebase local-only commits freely
- ✅ Rebase on feature branches before opening a PR (if you haven't shared it)
- ❌ Never rebase `main`, `develop`, or any branch others have pulled
- ❌ Never `git push --force` to a shared branch (unless explicitly agreed as the team norm with `--force-with-lease`)

---

## Basic Syntax

```bash
# Rebase the last N commits
git rebase -i HEAD~N

# Rebase commits since a specific commit (exclusive)
git rebase -i <commit-hash>

# Rebase onto a branch tip
git rebase -i origin/main
```

---

## The Rebase Editor

When you run `git rebase -i HEAD~4`, your editor opens with something like:

```
pick a1b2c3d feat(auth): add login endpoint
pick e4f5g6h fix typo in login handler
pick i7j8k9l add more auth stuff
pick m1n2o3p refactor auth module

# Rebase commands:
# p, pick   = use commit
# r, reword = use commit, but edit the commit message
# e, edit   = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup  = like squash, but discard this commit's log message
# d, drop   = remove commit
```

Change the command in front of each commit, save, and close the editor.

---

## Recipe 1: Fix a Commit Message (reword)

```
pick a1b2c3d feat(auth): add login endpoint
reword e4f5g6h fix typo in login handler     ← change pick to reword
pick i7j8k9l add more auth stuff
```

After saving, git will open the message editor for each `reword` commit. Fix the message and save.

**Result:**
```
feat(auth): add login endpoint
fix(auth): correct typo in error message handler   ← improved
add more auth stuff
```

---

## Recipe 2: Combine Messy Commits (squash / fixup)

You have three commits that are really one feature:

```
pick a1b2c3d feat(auth): add basic login form
pick e4f5g6h add validation to login form          ← also part of the feature
pick i7j8k9l fix login form error state            ← also part of the feature
```

Use `fixup` to absorb them silently:

```
pick a1b2c3d feat(auth): add basic login form
fixup e4f5g6h add validation to login form         ← absorbed, message discarded
fixup i7j8k9l fix login form error state           ← absorbed, message discarded
```

**Result:** One clean commit: `feat(auth): add basic login form`

Use `squash` instead of `fixup` if you want to merge all three messages into one and edit the combined message.

---

## Recipe 3: Reorder Commits

```
pick a1b2c3d test(auth): add unit tests for login
pick e4f5g6h feat(auth): add login form component
```

Just swap the lines:

```
pick e4f5g6h feat(auth): add login form component    ← moved first
pick a1b2c3d test(auth): add unit tests for login    ← tests after feat
```

**⚠️ Reorder carefully**: If commit B depends on changes from commit A, reordering will cause a conflict. Test the reorder on a branch first if unsure.

---

## Recipe 4: Split a Commit (edit)

A commit contains two unrelated changes that should be separate:

```
pick a1b2c3d feat(auth): add login + fix dashboard bug
```

Change to `edit`:

```
edit a1b2c3d feat(auth): add login + fix dashboard bug
```

Git applies the commit and stops. You're now in the middle of a rebase:

```bash
# Undo the commit but keep the changes in working directory
git reset HEAD~1

# Now you have all the changes unstaged
# Stage only the auth changes
git add src/features/auth/
git commit -m "feat(auth): add login form component"

# Stage the dashboard fix
git add src/features/dashboard/
git commit -m "fix(dashboard): resolve stale data after navigation"

# Continue the rebase
git rebase --continue
```

**Result:** Two atomic commits instead of one mixed one. ✅

---

## Recipe 5: Drop a Useless Commit

```
pick a1b2c3d feat(auth): add login endpoint
pick e4f5g6h wip                              ← this should never exist
pick i7j8k9l feat(auth): complete login flow
```

```
pick a1b2c3d feat(auth): add login endpoint
drop e4f5g6h wip                              ← gone
pick i7j8k9l feat(auth): complete login flow
```

**Result:** The "wip" commit is erased from history.

---

## Recipe 6: Polish Before PR (Full Cleanup)

Before opening a PR, clean up 5 messy work-in-progress commits:

```
# Before:
37a4f21 fix
29b3c10 add stuff
a1e9d81 wip
99f2c44 more wip
72d1c98 feat(auth): start login

# Run:
git rebase -i HEAD~5

# Rebase editor:
pick 72d1c98 feat(auth): start login
fixup 99f2c44 more wip
fixup a1e9d81 wip
fixup 29b3c10 add stuff
reword 37a4f21 fix
```

After saving, fix the `reword` commit's message properly:

```
fix(auth): handle empty email on login form submit
```

**Result:**
```
feat(auth): add login form with email/password
fix(auth): handle empty email on login form submit
```

Two clean, reviewable commits. A PR reviewer's dream.

---

## Aborting a Rebase

If anything goes wrong during a rebase, escape:

```bash
# Return to the pre-rebase state — nothing is changed
git rebase --abort
```

---

## Resolving Rebase Conflicts

If a conflict occurs during rebase:

```bash
# Git stops and shows the conflict
# Open conflicted files in your editor, resolve them
# Then:
git add <resolved-file>
git rebase --continue

# Or, skip the conflicting commit (use carefully — you're discarding it)
git rebase --skip

# Or, abort entirely
git rebase --abort
```

---

## Rebase vs Merge

| | Rebase | Merge |
|:---|:---|:---|
| History | Linear, clean | Preserves branching topology |
| Safety | Unsafe on shared branches | Always safe |
| PR readability | ✅ Easier to review | ❌ Noisy merge commits |
| Use case | Before pushing to PR | After PR approval |
| Conflicts | Resolved commit-by-commit | Resolved once |

**Rule of thumb**: Rebase to clean up before pushing. Merge to integrate after review.

---

## `--force-with-lease` vs `--force`

If you've already pushed a branch and need to force-push after rebase:

```bash
# ✅ Safer: fails if someone else has pushed since you last fetched
git push --force-with-lease origin feature/my-feature

# ❌ Dangerous: overwrites whatever is on the remote, even others' work
git push --force origin feature/my-feature
```

**Always use `--force-with-lease`**, never bare `--force`.
