# Monorepo Scoping — Commit Scope Conventions

In a monorepo, scope precision is critical. The scope tells the reader immediately which part of the system changed — without having to look at the file list. This is especially important for automated changelogs and semantic version bumping per package.

---

## The Scope Decision Tree

```
What changed?
│
├── A standalone package/app
│   └── Use the package name: feat(web): ..., fix(api): ..., chore(ui-lib): ...
│
├── Multiple packages for the same feature
│   └── Use the feature name: feat(auth): ..., fix(payments): ...
│
├── Project tooling/infrastructure
│   └── Use infrastructure scope: chore(ci): ..., chore(build): ..., chore(config): ...
│
├── Agents/AI tooling
│   └── Use agent scope: chore(agents): ..., feat(agents): ...
│
└── Cross-cutting concern (affects the whole monorepo)
    └── Use core: refactor(core): ..., chore(deps): ...
```

---

## Common Scope Vocabulary

### Application Scopes

| Scope | Covers |
|:---|:---|
| `web` | Main web application |
| `app` | Mobile or desktop application |
| `api` | API server/routes |
| `admin` | Admin panel or CMS |
| `dashboard` | Dashboard feature |

### Feature Scopes (Cross-Package)

| Scope | Covers |
|:---|:---|
| `auth` | Authentication, sessions, OAuth, permissions |
| `db` | Database schemas, migrations, queries |
| `storage` | File storage, uploads, buckets |
| `payments` | Billing, subscriptions, invoicing |
| `notifications` | Emails, push, in-app |
| `search` | Full-text search, filters, indexing |
| `realtime` | WebSockets, SSE, live updates |

### Infrastructure Scopes

| Scope | Covers |
|:---|:---|
| `ci` | GitHub Actions, pipelines, automated checks |
| `build` | Bundle config, Vite, tsconfig, esbuild |
| `config` | Environment variables, shared configuration |
| `deps` | Dependency updates, lock file changes |
| `infra` | Cloud infrastructure, IaC |
| `agents` | AI agent skills, prompts, workflows |

### Code Quality Scopes

| Scope | Covers |
|:---|:---|
| `types` | Shared TypeScript types, interfaces |
| `utils` | Shared utility functions |
| `core` | Foundational patterns, framework config |
| `ui` | Shared UI component library |

---

## Multi-Package Feature Patterns

When a feature touches multiple packages, use the **feature name** as scope — not the package name:

```bash
# Implementing a new auth feature across api + web packages:

# 1. DB schema first
git add packages/db/
git commit -m "feat(auth): add OAuth provider table to schema"

# 2. API server functions
git add packages/api/
git commit -m "feat(auth): implement GitHub OAuth callback handler"

# 3. Web UI components
git add apps/web/src/features/auth/
git commit -m "feat(auth): add GitHub OAuth button to login page"

# 4. Tests
git add apps/web/src/features/auth/__tests__/
git commit -m "test(auth): add E2E tests for GitHub OAuth flow"
```

All four use `auth` scope — they're all part of the same feature narrative. The commit history reads as a coherent story.

---

## Package-Specific Patterns

When a change is **only** inside one package and doesn't relate to a cross-cutting feature:

```bash
# Isolated button component change in ui package
git commit -m "fix(ui): resolve Button loading state flash on mount"

# Isolated API config change
git commit -m "chore(api): increase default query limit from 20 to 50"

# Isolated migration in db package
git commit -m "chore(db): add index on items.createdAt for sort performance"
```

---

## Scope Anti-Patterns

| ❌ Bad Scope | Problem | ✅ Better |
|:---|:---|:---|
| `fix(src/components/Button.tsx): ...` | File path as scope | `fix(ui): ...` |
| `feat(bigchange): ...` | Vague label | `feat(auth): ...` |
| `fix(everything): ...` | Too broad | Split into multiple atomic commits |
| `feat(): ...` | Empty scope | Add the scope |
| `fix(BUTTON): ...` | Inconsistent casing | Always lowercase |

---

## Scoping in Single-Package Projects

In a single-package project, scopes still add value — use **feature area** or **module**:

```
feat(auth): add magic link login
fix(dashboard): resolve stale data after filter change
refactor(forms): extract shared validation hooks
test(api): add integration tests for pagination
chore(config): add path aliases for cleaner imports
```
