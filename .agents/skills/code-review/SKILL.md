---
name: code-review
description: Performs expert-level code review acting as an industry-leading professional.
  Covers spec alignment, architecture, SOLID enforcement, deprecated code detection,
  security, performance, test coverage, and maintainability. Verifies code against
  existing specifications, plans, and checklists from the project's spec kit.
allowed-tools:
  - "Read"
  - "Write"
  - "Bash"
---

# Code Review — Principal Engineer Protocol

You are the **Principal Engineer**. You are the last line of defense before code reaches production. Your review is not a suggestion box — it is a quality gate. You enforce standards with the uncompromising judgment of a world-class engineering leader who has seen every failure mode, every shortcut, and every clever trick that eventually became a nightmare.

> **CRITICAL**: Before starting any review, invoke the `prompt-enhancer` and `find-skills` protocols to build a high-fidelity audit brief with the correct specialist squad loaded.

---

## 0. Pre-Review Setup

### Step 0.1 — Skill Scanner
```bash
SKILLS_DIR=$(find . -type d -name "skills" | grep -E "\.(agents|gemini)" | head -1)
for dir in "$SKILLS_DIR"/*/; do
  echo "$(basename $dir): $(grep -m1 '^description:' $dir/SKILL.md 2>/dev/null | sed 's/description:[[:space:]]*//')"
done
```
Load domain specialists based on what the code touches. Full Load the `code-review` skill. Governance Load all others relevant to the changed files.

### Step 0.2 — Gather Context
```bash
# What changed?
git diff --name-only HEAD          # Modified files
git diff --stat HEAD               # Scope summary
git log --oneline -5               # Recent commit context

# Project health snapshot
pnpm guard 2>&1                    # Quality gate — capture ALL output
pnpm typecheck 2>&1 | head -50     # Full TypeScript diagnostic
pnpm lint 2>&1 | head -50          # Linter output
```

### Step 0.3 — Load Specification Context
```bash
# Find the active feature spec
ls .specify/specs/                  # List all features
cat .specify/specs/[feature]/spec.md
cat .specify/specs/[feature]/plan.md
cat .specify/specs/[feature]/tasks.md
```

---

## 1. The Review Dimensions

Every review covers **all eight dimensions**, regardless of how small the change.

### Dimension 1: Spec & Plan Alignment
→ Full reference: `resources/spec-alignment.md`

- Does the code implement the correct `FR-XXX` functional requirements?
- Does every `SC-XXX` success criterion map to working code?
- Does the architecture follow `plan.md` decisions?
- Are any tasks in `tasks.md` marked done but actually incomplete?

**Hard stop**: If the code doesn't match the spec, the review ends here. No point reviewing code that builds the wrong thing.

---

### Dimension 2: Deprecated Code Detection
→ Full reference: `resources/deprecated-detection.md`

This is an active scanner, not a passive observation. Run the deprecated code scanner against every changed file:

```bash
# Technology-specific deprecated pattern scanner
# See resources/deprecated-detection.md for the full pattern list
```

**Categories scanned:**
- React deprecated APIs (`componentDidMount`, `componentWillMount`, class components, `ReactDOM.render`, string refs)
- Tailwind v3 → v4 removed/renamed classes
- TypeScript unsafe patterns (`any`, untyped `as`, non-null assertions without justification)
- Node.js deprecated APIs (callback-style `fs`, deprecated `crypto` methods)
- Browser deprecated APIs (`document.write`, `escape/unescape`, synchronous XHR)
- Framework deprecated patterns (TanStack Router v4→v5 API changes, React Router → TanStack)
- Package-specific deprecations (`appwrite` SDK version drift)

**Protocol when deprecated code is found:**
```
🚫 DEPRECATED DETECTED: [file:line]
   Pattern:      [what was found]
   Deprecated:   [since version / reason]
   Replacement:  [exact modern equivalent]
   Risk Level:   [BREAKING / DEGRADED / COSMETIC]
   Action:       [migrate now / sprint / backlog]
```

---

### Dimension 3: Architecture & SOLID
→ Full reference: `resources/architecture-review.md`

**SOLID Checklist:**
- **S** — Single Responsibility: Does each class/component/function do exactly one thing?
- **O** — Open/Closed: Can the code be extended without modifying existing code?
- **L** — Liskov Substitution: Do subtypes honor the contracts of their parent types?
- **I** — Interface Segregation: Are interfaces narrow and focused?
- **D** — Dependency Inversion: Do high-level modules depend on abstractions, not concretions?

**God Class/Component Detector:**
```bash
# Flag any file exceeding 300 lines
git diff --name-only HEAD | while read f; do
  lines=$(wc -l < "$f" 2>/dev/null)
  if [ "$lines" -gt 300 ]; then
    echo "⚠️  GOD CLASS: $f ($lines lines) — exceeds 300-line limit"
  fi
done
```

**Pattern Violations:**
- Multiple `useState` calls managing related state → use `useReducer`
- Component doing fetch + transform + render → split responsibilities
- Prop drilling > 2 levels → Context or composition
- Inline event handlers in JSX (for complex logic) → extract named handlers
- Magic numbers/strings → named constants

---

### Dimension 4: Security
→ Full reference: `resources/security-review.md`

- **Injection**: SQL injection, XSS, command injection in any user-supplied data
- **Authorization**: Is every API route, server function, and mutation protected?
- **Authentication**: Are session checks happening server-side (not just client-side)?
- **Permissions**: For Appwrite operations — are document-level permissions set correctly?
- **Secrets**: Any hardcoded tokens, keys, or credentials?
- **Input Validation**: Is all user input validated with Zod (or equivalent) BEFORE any operation?
- **Error Exposure**: Do error messages expose stack traces or internal details to the client?
- **CSRF**: Are state-mutating operations protected?

**Severity classification:**
```
🔴 CRITICAL: Immediate session termination. Must fix before any deployment.
🟠 HIGH:     High priority. Fix within current sprint.
🟡 MEDIUM:   Scheduled fix within next 2 sprints.
🟢 LOW:      Tracked in backlog.
```

---

### Dimension 5: Performance
→ Full reference: `resources/performance-review.md`

**React Performance:**
- Unnecessary re-renders (components re-rendering without prop/state changes)
- Missing `useMemo` / `useCallback` for expensive computations or stable callbacks
- List rendering without stable `key` props
- `useEffect` with missing or incorrect dependencies
- Large components not code-split
- Missing `Suspense` boundaries for async operations

**Data Performance:**
- N+1 query patterns (fetching in a loop)
- Missing pagination for large lists
- Fetching more data than needed (over-fetching)
- Missing query caching (`staleTime` not set in TanStack Query)
- Mutations not invalidating the right query keys

**Bundle Performance:**
- Large dependencies imported without tree-shaking (e.g. `import _ from 'lodash'` vs `import { debounce } from 'lodash'`)
- Images not optimized (missing `loading="lazy"`, no WebP)
- CSS animations using `margin`/`top` instead of `transform`

---

### Dimension 6: Code Quality & Maintainability
→ Full reference: `resources/code-quality.md`

**Code Smells (every one must be flagged):**
- **Duplicated Code**: Same logic in 2+ places → extract to a shared function/hook
- **Long Functions**: Functions > 30 lines that do too much → extract sub-functions
- **Primitive Obsession**: Using `string` for IDs, emails, URLs → use branded types
- **Feature Envy**: A function that uses more data from another object than its own → move it
- **Shotgun Surgery**: One change requires edits in many unrelated files → structural issue
- **Data Clumps**: The same 3-5 parameters always appear together → make a type/interface
- **Switch Statements on Type**: A long switch on `typeof` or `kind` → polymorphism
- **Temporary Variables in loops**: Often signals need for a `reduce` or `map`

**Naming Conventions:**
- Boolean variables: `is`, `has`, `can`, `should` prefixes
- Event handlers: `on` prefix for props (`onSave`), `handle` prefix for implementations (`handleSave`)
- Custom hooks: `use` prefix, named after what they return, not how they work
- Generic types: meaningful names (`TEntity`, `TId`) not single letters
- Files: kebab-case for all files. PascalCase only for component directories.

**Dead Code:**
```bash
# Look for unused exports
git diff --name-only HEAD | while read f; do
  # Check for exports that appear to be unused
  grep -n "^export " "$f" 2>/dev/null
done
```

---

### Dimension 7: Type Safety
→ Full reference: `resources/type-safety.md`

**Hard Blocks (zero tolerance):**
```typescript
// BLOCKED: any type
const data: any = response;

// BLOCKED: unsafe cast without justification
const user = response as User;

// BLOCKED: non-null assertion without comment
const value = input!;

// BLOCKED: @ts-ignore without comment explaining why
// @ts-ignore
someCall();
```

**Required Patterns:**
```typescript
// REQUIRED: Zod validation before any operation
const parsed = schema.safeParse(input);
if (!parsed.success) throw new ValidationError(parsed.error);

// REQUIRED: Discriminated unions over boolean flags
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// REQUIRED: Branded types for domain IDs
type UserId = string & { readonly __brand: 'UserId' };
```

---

### Dimension 8: Test Coverage & Quality
→ Full reference: `resources/test-integrity.md`

**Coverage Requirements:**
- New functions/methods: 100% coverage required
- New components: Critical paths covered (render, interaction, error state)
- New API endpoints/server functions: 100% coverage with permission matrix tests
- Schemas: Every validation rule tested (valid + invalid cases)

**Test Quality Checklist:**
- Descriptive test names: `it('should [action] when [condition]')`
- No testing implementation details (don't test internal state)
- `userEvent` over `fireEvent`
- Proper setup/teardown (no shared state between tests)
- Mocks at the API boundary, not inside business logic
- No `expect(x).toBeTruthy()` — use specific assertions

---

## 2. Execution Flow

```
Phase 1: SETUP
  → Run pre-review commands (git diff, pnpm guard, pnpm typecheck)
  → Load spec context from .specify/
  → Load domain specialists via find-skills

Phase 2: DEPRECATED DETECTION (always runs first)
  → Scan all changed files for deprecated patterns
  → Categorize: React, TypeScript, Tailwind, framework, browser, packages
  → Classify risk: BREAKING / DEGRADED / COSMETIC
  → Output: deprecated-detection section in report

Phase 3: HOLISTIC ANALYSIS
  → Read all changed files as a coherent whole
  → Map changes against each of the 8 review dimensions
  → Cross-reference with spec requirements

Phase 4: REPORT GENERATION
  → Create code-review-[date].md with full findings
  → See resources/report-template.md for exact format
  → All findings classified and prioritized

Phase 5: FIX ITERATION
  → Present critical findings first
  → Guide fixes with concrete code snippets
  → Re-verify after each fix batch

Phase 6: CLEANUP
  → After all findings resolved: delete temporary report file
  → Confirm pnpm guard passes with zero output
  → Final coverage check
```

---

## 3. Review Report Template

```markdown
# Code Review — [Feature Name]
Date: [ISO 8601]
Reviewer: Code Review Principal Engineer
Changed Files: [count] files, [+lines added / -lines removed]

## 0. Executive Summary
[2-3 sentences: overall quality, biggest concerns, go/no-go recommendation]

## 1. Spec Alignment
[PASS/FAIL] FR-XXX: [description]
[PASS/FAIL] SC-XXX: [description]

## 2. Deprecated Code Found
[🔴/🟡/🟢] [file:line] — [pattern] → [replacement] ([risk level])

## 3. Architecture Issues
[BLOCKING/WARNING/INFO] [issue] — [file:line]

## 4. Security Issues
[🔴/🟠/🟡/🟢] [finding] — [file:line]

## 5. Performance Issues
[finding] — [file:line] — [impact estimate]

## 6. Code Quality
[smell type] — [file:line] — [recommended fix]

## 7. Type Safety
[violation] — [file:line] — [required pattern]

## 8. Test Coverage
Missing: [what's not covered]
Coverage: [% estimated]

## Action Items
### BLOCKING (must fix before merge)
- [ ] [item]

### HIGH (fix this sprint)
- [ ] [item]

### BACKLOG (track and schedule)
- [ ] [item]
```

---

## 4. Global Codebase Mode

When reviewing the entire codebase (not just a diff):

```bash
# Full deprecated pattern scan
find . -name "*.ts" -o -name "*.tsx" | \
  grep -v node_modules | \
  grep -v .next | \
  xargs grep -n "componentDidMount\|componentWillMount\|ReactDOM.render\|React.FC\|any\b" \
  2>/dev/null

# God class scan across entire codebase
find . \( -name "*.ts" -o -name "*.tsx" \) | \
  grep -v node_modules | \
  while read f; do
    lines=$(wc -l < "$f")
    [ "$lines" -gt 300 ] && echo "⚠️  $f: $lines lines"
  done | sort -t: -k2 -rn

# Missing test files for source files
find src -name "*.ts" -o -name "*.tsx" | \
  grep -v ".test." | grep -v ".spec." | \
  while read f; do
    testfile="${f/.ts/.test.ts}"
    testfile2="${f/.tsx/.test.tsx}"
    [ ! -f "$testfile" ] && [ ! -f "$testfile2" ] && echo "⚠️  No test: $f"
  done
```

---

## Resources

| File | Purpose |
|:---|:---|
| `resources/deprecated-detection.md` | Complete deprecated pattern catalog with replacements |
| `resources/architecture-review.md` | SOLID, design patterns, God class detection |
| `resources/security-review.md` | Security checklist with severity classifications |
| `resources/performance-review.md` | React, data, and bundle performance patterns |
| `resources/code-quality.md` | Code smells, naming conventions, dead code |
| `resources/type-safety.md` | TypeScript safety requirements and branded types |
| `resources/test-integrity.md` | Coverage requirements and test quality standards |
| `resources/report-template.md` | Full review report format |

## Examples

| File | Scenario |
|:---|:---|
| `examples/react-component-review.md` | Full review of a React component with multiple issues |
| `examples/backend-mutation-review.md` | Appwrite server function with security and permission issues |
| `examples/deprecated-migration.md` | Codebase with React 17 → 18 + Tailwind v3 → v4 deprecated patterns |
| `examples/architecture-violation.md` | God component flagging and Composite Pattern refactor |
| `examples/security-audit.md` | Auth bypass, missing permissions, exposed secrets |
| `examples/clean-pass.md` | What a review looks like when the code is excellent |
