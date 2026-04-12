# Conventional Commits — Full Specification Reference

The Conventional Commits specification is a lightweight convention on top of commit messages. It provides an easy set of rules for creating an explicit commit history, which makes it easier to write automated tools on top of (changelogs, semantic versioning, release automation).

---

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Requirements:**
- `type` and `description` are **required**
- `scope` is **optional but strongly recommended** in monorepos
- Body and footers are **optional**

---

## Types — Complete Reference

| Type | Use When | Version Bump |
|:---|:---|:---|
| `feat` | New feature, new behavior, new capability | MINOR |
| `fix` | Bug fix — corrects wrong or broken behavior | PATCH |
| `refactor` | Code restructure with no behavior or API change | none |
| `perf` | Performance improvement (faster, less memory, etc.) | PATCH |
| `test` | Adding or updating tests | none |
| `docs` | Documentation only changes (README, comments, JSDoc) | none |
| `style` | Formatting, whitespace, semicolons — no logic changes | none |
| `chore` | Maintenance: deps, build scripts, CI config, tooling | none |
| `revert` | Reverts a previous commit | depends on reverted |
| `build` | Changes to build system or external dependencies | none |
| `ci` | CI/CD configuration and scripts | none |

### `feat` Examples

```
feat(auth): add GitHub OAuth provider
feat(dashboard): implement infinite scroll for activity feed
feat(api): expose pagination metadata in list responses
feat(notifications): add real-time updates via Server-Sent Events
feat(search): implement full-text search with relevance scoring
```

### `fix` Examples

```
fix(auth): redirect to login when session expires mid-navigation
fix(form): prevent double submission on rapid button clicks
fix(api): sanitize query parameters before Appwrite filter injection
fix(ui): resolve z-index conflict between modal and sticky header
fix(pagination): correctly reset page to 1 on filter change
```

### `refactor` Examples

```
refactor(dashboard): decompose StatCard into Composite sub-components
refactor(auth): extract session management into dedicated hook
refactor(api): centralize error handling in createServerFn wrapper
refactor(ui): migrate from inline styles to design token classes
refactor(db): consolidate duplicate query builders into shared factory
```

### `perf` Examples

```
perf(list): virtualize items list — eliminates 300+ DOM nodes at scroll
perf(images): add responsive srcset — reduces initial payload by 60%
perf(queries): add compound index for filtered+sorted Appwrite queries
perf(bundle): lazy-load chart components — saves 140KB from initial load
```

### `test` Examples

```
test(auth): add E2E tests for login, logout, and session persistence
test(api): add schema validation tests for all Zod entity schemas
test(ui): add RTL interaction tests for DataTable sort and filter
test(forms): add validation boundary tests for all required fields
```

### `chore` Examples

```
chore(deps): update node-appwrite from 22.0.0 to 22.1.3
chore(agents): add git-commit skill to .agents/skills/
chore(config): configure pnpm workspace for new shared package
chore(ci): add caching step for pnpm store in GitHub Actions
```

---

## Breaking Changes

A breaking change is any change that would require consumers of the API to modify their code. It's signaled in two places:

1. A `!` after the type/scope: `feat(api)!: rename listItems to fetchItems`
2. A `BREAKING CHANGE:` footer

```
feat(api)!: change getAllItems to return paginated response

BREAKING CHANGE: getAllItems previously returned Item[]. It now returns
{ items: Item[]; total: number; cursor: string | null }. All callers
must be updated to destructure items from the response instead of
treating the return value as an array directly.
```

---

## Issue References

```
fix(auth): handle expired token before session call

Closes #142
```

```
feat(dashboard): add bulk selection with keyboard shortcuts

Implements #89
Closes #91
```

---

## Co-authored Commits

```
feat(api): implement rate limiting middleware

Co-authored-by: Jane Smith <jane@example.com>
Co-authored-by: Bob Lee <bob@example.com>
```

---

## Common Anti-Patterns to Reject

| Bad | Why It's Bad | What to Write Instead |
|:---|:---|:---|
| `fix: stuff` | No scope, no description | `fix(auth): prevent redirect loop on expired session` |
| `wip` | Not a commit, it's a save point | Stash it, or complete the work |
| `misc changes` | Meaningless — could be anything | Multiple atomic commits per intent |
| `update Button.tsx` | Describes a file, not an achievement | `feat(ui): add loading state to Button component` |
| `fix bug` | Which bug? | `fix(form): reset file input after successful upload` |
| `added new feature` | Past tense, vague | `feat(posts): add rich text editor with markdown preview` |
| `FINAL FINAL v3` | Not version control, it's panic | Proper semantic message |
