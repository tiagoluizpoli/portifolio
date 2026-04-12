# Message Patterns — 50+ Real Commit Message Examples

A reference library of production-grade commit messages for every situation. Use these as templates for crafting accurate, intent-driven messages.

---

## feat — New Features

```
feat(auth): add magic link login via email
feat(auth): implement session refresh with exponential backoff
feat(auth): support OAuth2 PKCE flow for mobile clients
feat(auth): add team-based role assignment on signup

feat(dashboard): add date range picker to analytics header
feat(dashboard): implement exportable CSV for all data tables
feat(dashboard): add real-time update badge on stale data

feat(api): expose cursor-based pagination on all list endpoints
feat(api): add request ID header for end-to-end request tracing
feat(api): implement idempotency keys for mutation endpoints

feat(ui): add Skeleton loader component with layout-matching variants
feat(ui): implement Popover with portal rendering and focus trap
feat(ui): add animated Badge component with spring entrance

feat(search): implement full-text search with Appwrite index
feat(search): add search history with localStorage persistence
feat(search): add keyboard shortcut (Cmd+K) to focus search

feat(storage): add non-destructive file delete with trash bucket
feat(storage): implement multi-file upload with progress tracking
feat(storage): add file preview for PDF, image, and video types

feat(notifications): send welcome email on account creation
feat(notifications): add in-app toast queue with stacking and dismiss
feat(notifications): implement read/unread state for notification center

feat(agents): add git-commit skill to agents library
feat(agents): implement find-skills autonomous routing protocol
```

---

## fix — Bug Fixes

```
fix(auth): redirect to login when JWT expires during navigation
fix(auth): prevent double-submission on login button rapid click
fix(auth): resolve race condition in session refresh on parallel requests

fix(dashboard): reset pagination to page 1 on filter change
fix(dashboard): prevent stale cache from showing deleted items
fix(dashboard): resolve layout shift when sidebar transitions

fix(api): sanitize user input before Appwrite query construction
fix(api): return 404 instead of 500 when document not found
fix(api): handle AppwriteException code 409 on duplicate ID

fix(ui): resolve Button loading spinner alignment on Safari 16
fix(ui): fix focus trap escape in nested Dialog components
fix(ui): prevent tooltip from overflowing viewport on small screens

fix(forms): clear file input after successful upload
fix(forms): show validation error immediately on blur, not only on submit
fix(forms): prevent form submit when Enter pressed in textarea

fix(storage): handle partial upload failure with cleanup rollback
fix(storage): resolve file URL expiry on long-lived sessions
```

---

## refactor — Internal Restructuring

```
refactor(auth): extract session cookie logic into dedicated utility
refactor(auth): replace inline permission checks with hasPermission() guard
refactor(auth): decompose AuthProvider into smaller focused providers

refactor(dashboard): decompose StatCard into Composite sub-components
refactor(dashboard): extract useDashboardData hook from DashboardPage
refactor(dashboard): replace magic numbers with named duration constants

refactor(api): centralize AppwriteException handling in server function wrapper
refactor(api): extract query builder factories for reuse across functions
refactor(api): migrate all raw string queries to Query builder methods

refactor(forms): extract shared Zod schemas to packages/schemas/
refactor(forms): unify form error display with FormMessage component
refactor(forms): replace controlled inputs with react-hook-form in all forms

refactor(core): migrate environment variable access to typed config object
refactor(core): centralize all collection IDs in a single constants file
```

---

## perf — Performance Improvements

```
perf(list): virtualize items list with @tanstack/react-virtual
perf(images): add Next.js Image with responsive srcset and AVIF format
perf(queries): add compound Appwrite index for filtered+sorted list queries
perf(bundle): lazy-load recharts — saves 140KB from initial JS bundle
perf(forms): debounce autosave to reduce API calls by 90%
perf(animations): use transform/opacity only — eliminate layout repaints
```

---

## test — Tests

```
test(auth): add unit tests for session refresh retry logic
test(auth): add E2E tests for login, logout, and session persistence
test(auth): add integration tests for OAuth callback handling

test(api): add Zod schema validation tests for all entity schemas
test(api): add server function tests with mocked Appwrite SDK
test(api): add error path tests for 401, 403, 404, and 409 responses

test(ui): add RTL interaction tests for DataTable sort, filter, and select
test(ui): add accessibility tests with jest-axe for all dialog components
test(ui): add snapshot tests for Skeleton variants

test(forms): add validation boundary tests for all required fields
test(forms): add async validation tests for server-roundtrip fields
```

---

## chore — Maintenance

```
chore(deps): update node-appwrite to 22.1.3
chore(deps): update @tanstack/react-query from 5.17 to 5.24
chore(deps): pin react to 19.0.0 — avoid unstable canary builds

chore(ci): add pnpm store caching to GitHub Actions workflow
chore(ci): add parallel test matrix for unit, integration, and E2E
chore(ci): fail pipeline on any TypeScript strict error

chore(config): add path aliases for all workspace packages
chore(config): configure Biome for consistent import ordering
chore(config): add .env.example with all required environment variables

chore(agents): add speckit-clarify skill to agents library
chore(agents): update find-skills to support governance load mode
```

---

## docs — Documentation

```
docs(readme): add local development setup instructions
docs(api): document all server function signatures with JSDoc
docs(auth): add sequence diagram for OAuth2 PKCE flow
docs(contributing): add commit message guidelines with examples
docs(agents): add SKILL.md authoring guide for new specialists
```

---

## revert — Reverting Commits

```
revert: feat(api): add cursor pagination on list endpoints

This reverts commit a1b2c3d4. The cursor implementation breaks
backward compatibility with existing clients that rely on offset
pagination. Reverting while a migration path is designed.
```

---

## Multi-Line Body Examples

### Feature with Context

```
feat(storage): implement non-destructive file delete with trash bucket

Files are no longer permanently deleted on user request. This change
implements a two-stage deletion lifecycle:
1. "Delete" moves the file to a TRASH bucket with a 30-day TTL
2. Users can restore from trash within 30 days
3. After 30 days, a scheduled job permanently deletes trash items

This prevents accidental data loss and enables an undo pattern.
The trash bucket requires a new Appwrite bucket: TRASH_BUCKET_ID.
Run `pnpm migrate` to create it before deploying.
```

### Refactor with Impact

```
refactor(dashboard): decompose StatCard into Composite sub-components

StatCard.tsx reached 347 lines with 6 distinct responsibilities,
violating the 300-line component limit. Decomposed using the
Composite Pattern into:

- StatCard.Root    (~60 lines): data fetching, layout container
- StatCard.Value   (~70 lines): formatted value + change display
- StatCard.Trend   (~50 lines): trend icon + color coding
- StatCard.Chart   (~80 lines): mini sparkline chart
- StatCard.Actions (~60 lines): edit/archive context menu

Visual output is pixel-identical to before. All existing tests pass.
```

### Bug Fix with Root Cause

```
fix(auth): prevent redirect loop when session expires mid-navigation

When a user's session expired while TanStack Router was processing
a navigation, the auth middleware would redirect to /login with no
redirect_to param, and the login page would redirect back to the
same route that triggered the expiry — causing an infinite loop.

Root cause: middleware extracted redirect_to from the request URL
but used the router URL instead when path was not yet resolved.

Fix: use request.url as the canonical source for redirect_to.
Verified with session expiry E2E test (test/e2e/auth/expiry.spec.ts).
```
