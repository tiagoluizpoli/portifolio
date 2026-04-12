# Example: Deprecated Code Migration Review

**Scenario**: Performing a comprehensive deprecated patterns audit before a major version upgrade.

---

## Running the Full Deprecated Scan

```bash
$ bash .agents/skills/code-review/resources/deprecated-detection.md --run-scanner

=== DEPRECATED PATTERN SCAN ===

--- src/components/skills/skill-list.tsx ---
  🔴 React: Line 3   — import ReactDOM from 'react-dom' → 'react-dom/client'
  🔴 React: Line 12  — ReactDOM.render() → createRoot().render()
  🟡 React: Line 8   — React.FC type (discouraged)
  🟠 TypeScript: Line 45 — `any` type on skills data

--- src/lib/appwrite.ts ---
  🟠 Appwrite: Line 23 — createSession(email, password) → createEmailPasswordSession
  🟠 Appwrite: Line 67 — read("any") → Permission.read(Role.any())
  🟠 Appwrite: Line 68 — write("user:userId") → Permission.write(Role.user(userId))

--- src/components/about/about-form.tsx ---
  🟡 React: Line 1   — React.FC type
  🟠 TypeScript: Line 89 — @ts-ignore without comment

--- styles/global.css ---
  🟡 Tailwind: Line 34 — shadow-sm → shadow-xs (v4 rename)
  🟡 Tailwind: Line 45 — blur-sm → blur-xs (v4 rename)
  🟡 Tailwind: Line 67 — bg-blue-500 bg-opacity-50 → bg-blue-500/50 (v4)
  🟡 Tailwind: Line 88 — transform class → auto-applied in v4, remove

=== END DEPRECATED SCAN ===
```

---

## Migration Report

### Priority 1: BREAKING (fix before upgrade)

**`src/components/skills/skill-list.tsx:3,12` — ReactDOM.render → createRoot**
```typescript
// ❌ CURRENT (React 17 API — removed in React 18)
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// ✅ MIGRATED (React 18+ API)
import { createRoot } from 'react-dom/client';
const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');
createRoot(rootEl).render(<App />);
```
**Risk**: 🔴 BREAKING — App will not render at all with React 18+ without this change.

---

**`src/lib/appwrite.ts:23` — Appwrite SDK Session Creation**
```typescript
// ❌ CURRENT (SDK v10 API — removed in v13)
await account.createSession(email, password);

// ✅ MIGRATED (SDK v13+)
await account.createEmailPasswordSession(email, password);
```
**Risk**: 🔴 BREAKING — Login will return 400 Bad Request on SDK v13+.

---

### Priority 2: DEGRADED (fix this sprint)

**`src/lib/appwrite.ts:67-68` — String Permissions to Helpers**
```typescript
// ❌ CURRENT (old string format)
await databases.createDocument(DB_ID, SKILLS_ID, 'unique()', data, [
  'read("any")',
  'write("user:' + userId + '")',
]);

// ✅ MIGRATED (SDK v13+ Permission helpers)
await databases.createDocument(DB_ID, SKILLS_ID, ID.unique(), data, [
  Permission.read(Role.any()),
  Permission.write(Role.user(userId)),
]);
```
**Risk**: 🟠 DEGRADED — SDK v13 no longer accepts string format; permissions silently fail.

---

**`src/components/about/about-form.tsx:89` — @ts-ignore Without Comment**
```typescript
// ❌ CURRENT
// @ts-ignore
const result = appwriteHack(data);

// ✅ MIGRATED — Document WHY or fix the root cause
// @ts-expect-error — Appwrite SDK type definition doesn't include `customAttribute`
// tracked in: https://github.com/[org]/[repo]/issues/42
const result = appwriteHack(data);
```

---

### Priority 3: COSMETIC (schedule in backlog)

**`styles/global.css` — Tailwind v4 Class Renames**
```css
/* ❌ CURRENT (v3 names) */
.card { box-shadow: shadow-sm; }
.blur-effect { filter: blur-sm; }
.hero-bg { background: bg-blue-500; opacity: 0.5; }

/* ✅ MIGRATED (v4 names) */
.card { box-shadow: shadow-xs; }          /* shadow-sm → shadow-xs */
.blur-effect { filter: blur-xs; }         /* blur-sm → blur-xs */
.hero-bg { background: bg-blue-500/50; }  /* opacity via slash modifier */
/* Remove standalone `transform` class — auto-applied in v4 */
```

---

## Migration Playbook

Order of operations for this migration:

```
1. BREAKING fixes first (cannot ship without these)
   a. ReactDOM.render → createRoot (test: app renders)
   b. Appwrite createSession → createEmailPasswordSession (test: login works)

2. DEGRADED fixes second (this sprint)
   a. String permissions → Permission helpers (test: document creation works)
   b. @ts-ignore → @ts-expect-error with comments

3. COSMETIC in batches (next sprint, low risk)
   a. Tailwind class renames (visual regression test: screenshots pass)
   b. React.FC removal (no runtime impact)

4. Run full guard after each batch
   pnpm guard && pnpm test && echo "✅ Batch complete"
```
