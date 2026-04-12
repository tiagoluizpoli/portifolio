# File Organization — Feature-Based Architecture

This guide establishes the standard folder structure and naming conventions for all React projects in this workspace.

---

## The Structure

```
src/
├── app/                          # Route definitions (TanStack Router / Next.js)
│   ├── routes/
│   │   ├── __root.tsx            # Root layout
│   │   ├── index.tsx             # Home page
│   │   ├── dashboard.tsx         # Dashboard layout
│   │   └── dashboard/
│   │       ├── index.tsx         # Dashboard home
│   │       └── settings.tsx      # Dashboard settings
│   └── routeTree.gen.ts          # Auto-generated route tree
│
├── features/                     # Feature modules (the core of the app)
│   ├── auth/
│   │   ├── components/           # UI components specific to auth
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginForm.test.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/                # Custom hooks for auth logic
│   │   │   ├── useAuth.ts
│   │   │   └── useSession.ts
│   │   ├── utils/                # Pure utility functions
│   │   │   └── validate-credentials.ts
│   │   ├── types.ts              # Types specific to this feature
│   │   └── index.ts              # Public API (barrel export)
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── Dashboard.Root.tsx
│   │   │   ├── Dashboard.Sidebar.tsx
│   │   │   ├── Dashboard.Content.tsx
│   │   │   └── widgets/
│   │   │       ├── MetricsCard.tsx
│   │   │       └── ActivityFeed.tsx
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts
│   │   └── index.ts
│   │
│   └── content/                  # Example feature module
│       ├── components/
│       ├── hooks/
│       ├── schemas/              # Zod schemas for this feature
│       └── index.ts
│
├── components/                   # Shared UI components (global)
│   ├── ui/                       # shadcn primitives (never edit directly)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── input.tsx
│   └── composed/                 # Composed components (built from primitives)
│       ├── SaveButton.tsx
│       ├── DiscardButton.tsx
│       ├── LoadingButton.tsx
│       └── ConfirmDialog.tsx
│
├── hooks/                        # Truly global hooks
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   └── useLocalStorage.ts
│
├── lib/                          # Utilities and helpers
│   ├── utils.ts                  # cn(), formatDate(), etc.
│   ├── api.ts                    # API client configuration
│   └── constants.ts              # App-wide constants
│
├── types/                        # Shared type definitions
│   ├── common.ts                 # Generic utility types
│   └── api.ts                    # API response types
│
└── styles/                       # Global styles
    ├── globals.css               # CSS variables, @theme, base styles
    └── animations.css            # Keyframe definitions
```

---

## Naming Conventions

### Files
| Type | Convention | Example |
|:---|:---|:---|
| Component | PascalCase | `LoginForm.tsx` |
| Composite sub-component | Parent.Part | `Dashboard.Sidebar.tsx` |
| Hook | camelCase with `use` prefix | `useAuth.ts` |
| Utility | kebab-case | `validate-credentials.ts` |
| Type definition | camelCase | `types.ts` |
| Test | Same name + `.test` | `LoginForm.test.tsx` |
| Schema | camelCase | `schemas.ts` or `user-schema.ts` |
| Constant | kebab-case | `constants.ts` |
| Style | kebab-case | `globals.css` |

### Exports
| Type | Convention | Example |
|:---|:---|:---|
| Components | Named export | `export const Button = ...` |
| Hooks | Named export | `export function useAuth() { ... }` |
| Types | Named export | `export interface User { ... }` |
| Utils | Named export | `export function formatDate() { ... }` |
| Constants | Named UPPER_CASE | `export const MAX_RETRIES = 3` |

**Rule: No default exports** (except route components required by the framework). Named exports enable better refactoring, auto-imports, and tree-shaking.

---

## Barrel Exports (index.ts)

Each feature has an `index.ts` that defines its public API:

```tsx
// features/auth/index.ts — the PUBLIC API
export { LoginForm } from './components/LoginForm'
export { RegisterForm } from './components/RegisterForm'
export { useAuth } from './hooks/useAuth'
export { useSession } from './hooks/useSession'
export type { AuthState, LoginCredentials } from './types'

// ❌ NEVER export internal implementation details
// export { validatePassword } from './utils/validate-credentials' // PRIVATE!
```

**Rules**:
- Only export what consumers need
- Internal utils, helpers, and sub-components stay private
- Re-export types with `export type` for proper tree-shaking

---

## Colocation Principle

> If it's only used by one component, put it next to that component.

```
features/auth/components/
├── LoginForm.tsx          # Component
├── LoginForm.test.tsx     # Test — colocated
├── LoginForm.stories.tsx  # Story — colocated (if using Storybook)
└── login-animations.css   # Styles — colocated (if component-specific)
```

When something is used by 2+ features, promote it to a shared location:
- Shared component → `components/composed/`
- Shared hook → `hooks/`
- Shared util → `lib/`
- Shared type → `types/`
