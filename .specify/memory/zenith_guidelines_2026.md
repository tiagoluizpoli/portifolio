# Zenith Development Guidelines (2026)

These guidelines are MANDATORY for all work on the `zenith` (admin) application and should be referenced in every specification and implementation.

## Core Stack
- **Framework**: TanStack Start v1 (Stable/RC).
- **Library**: React 19 (Stable).
- **Styling**: Tailwind CSS v4 (Stable) + Shadcn UI (v4 CLI).
- **Runtime**: Node 22+.
- **Package Manager**: pnpm 9.x.

## 1. Project Configuration (`app.config.ts`)
- **Standard**: Use `defineConfig` from `@tanstack/react-start/config`.
- **Monorepo Support**: Always include `vite-tsconfig-paths` to resolve workspace aliases.
- **Nitro**: Configure the Nitro preset (e.g., `node-server` or `cloudflare-workers`) in the `nitro` key.

```typescript
import { defineConfig } from '@tanstack/react-start/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  vite: {
    plugins: [tsconfigPaths()],
  },
})
```

## 2. React 19 & SSR Best Practices
- **Refs**: Pass `ref` as a regular prop. Avoid `forwardRef`.
- **Hydration**: Use the `useHydrated()` hook for any client-only logic to prevent SSR mismatches.
- **Metadata**: Utilize `HeadContent` in `__root.tsx` for SEO and metadata hoisting.
- **Actions**: Prefer React 19 Actions for form handling (`useActionState`, `useFormStatus`).

## 3. Server-First Ergonomics (`createServerFn`)
- **Security**: The code inside `.handler()` is strictly server-side.
- **Validation**: Always use `.validator(zodSchema)` for type-safe inputs.
- **RPCs**: Server functions are compiled into type-safe RPCs. Use them for all AppWrite and Database interactions.

```typescript
export const secureAction = createServerFn({ method: 'POST' })
  .validator((d: MySchema) => d)
  .handler(async ({ data }) => {
    // process.env.APPWRITE_KEY is safe here
    return result
  })
```

## 4. Tailwind CSS v4 & Shadcn UI
- **CSS-First**: No `tailwind.config.js`. Theme extensions MUST live in `src/index.css` under the `@theme` block.
- **Colors**: Prefer **OKLCH** for all new color tokens.
- **Initialization**: Use the specific Shadcn CLI command for TanStack Start monorepos:
  `pnpm dlx shadcn@latest init -t start --monorepo`
- **Component Anatomy**: Shadcn components should use React 19 patterns (e.g., direct `ref` props).

## 5. Security & Environment Variables
- **Public Variables**: Prefix with `VITE_` (e.g., `VITE_APPWRITE_PROJECT_ID`).
- **Secret Variables**: NO prefix (e.g., `APPWRITE_API_KEY`). These are only accessible in Server Functions and Loaders (on the server).
- **Validation**: Validate all environment variables at startup in `src/config/env.ts`.

## 6. Tooling & Quality
- **Linter**: Biome ONLY. Run `pnpm lint` and `pnpm lint:write`.
- **Type-Check**: Run `pnpm typecheck` before any commit.
- **Commits**: Conventional Commits via Commitizen are mandatory.

## 9. Quality Gating
- **Checklists**: Every feature must have a `checklists/` directory. All items in the relevant checklists MUST be checked off before implementation starts.
- **Traceability**: Requirements in `spec.md` must be traceable to tasks in `tasks.md`.

## 7. Shared Logic - AppWrite Core
- **Single Source of Truth**: ALL AppWrite CRUD operations and Types MUST be consumed from `@repo/appwrite-core`.
- **Repository Pattern**: Apps should interact with Repository interfaces, not direct SDK calls.
- **Dry Principle**: Never duplicate data fetching logic across Zenith and Portfolio.

## 8. Exception Handling
- **Domain Exceptions**: Never expose raw SDK errors to the application layer.
- **Mapping**: Wrap repository calls in try/catch and use the `AppwriteErrorMapper`.
- **Granularity**: Use specific exception classes (e.g., `PermissionDenied`) for branching logic in the UI.
- **Robustness**: Ensure both Zenith and Portfolio handle these exceptions gracefully via error boundaries or toast notifications.
