---
name: tanstack-master
description: Expert guidance on building robust, hydration-safe, and high-performance applications with TanStack Start and React 19.
---

# TanStack Master Skill

This skill provides comprehensive instructions and best practices for building applications with **TanStack Start**, following the "Simple, Clean, and Solid" philosophy.

## Core Philosophy

1.  **Hydration First**: Assume hydration mismatches will happen unless explicitly guarded.
2.  **Client-Heavy UI, Server-Only Actions**: All UI logic (toggles, state, effects) should be standard React code. Use Server Functions only for data mutation and sensitive data fetching.
3.  **Isomorphic Routing, Isolated Execution**: Routes are shared, but execution context must be strictly managed.

---

## 1. Execution Model & Hydration

To avoid the "Sidebar Toggle" failure (hydration mismatches), use these patterns:

### Client-Only Rendering
Wrap interactive components that depend on browser APIs (window, localStorage, etc.) or have complex internal state in `<ClientOnly>`.

```tsx
import { ClientOnly } from '@tanstack/react-router'

export function AppLayout({ children }) {
  return (
    <div>
      <ClientOnly fallback={<SidebarSkeleton />}>
        <Sidebar />
      </ClientOnly>
      <main>{children}</main>
    </div>
  )
}
```

### useHydrated Hook
Use this hook to delay rendering or initialization until the client has taken over.

```tsx
import { useHydrated } from '@tanstack/react-router'

function MyComponent() {
  const isHydrated = useHydrated()
  
  if (!isHydrated) return null
  
  return <InteractiveElement />
}
```

---

## 2. Server Functions (Server Actions)

Server Functions are the bridge between the client and the server. Always define them in `*.functions.ts` or `*.server.ts` files.

### Definition
```tsx
import { createServerFn } from '@tanstack/react-start'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

export const updateProfile = createServerFn({ method: 'POST' })
  .validator(zodValidator(z.object({ name: z.string() })))
  .handler(async ({ data }) => {
    // This code ONLY runs on the server
    const user = await db.user.update({ data })
    return user
  })
```

### Usage in Components
```tsx
function ProfileEditor() {
  const update = updateProfile.useMutation()
  
  return (
    <button onClick={() => update.mutate({ name: 'New Name' })}>
      Update
    </button>
  )
}
```

---

## 3. Recommended Project Structure

Align your project to this structure for maximum clarity:

```text
app/
├── routes/              # File-based routes
├── components/          # React components (UI/Client)
├── functions/           # *.functions.ts (Server Function definitions)
├── services/            # *.server.ts (Direct DB/API logic, never imported by client)
├── router.tsx           # Router instance definition
├── client.tsx           # Client entry point
├── ssr.tsx              # SSR entry point
└── app.config.ts        # TanStack Start / Vite config
```

---

## 4. React 19 Integration

### use(Promise)
Instead of `<Await>`, use the native React 19 `use()` hook for streaming data from loaders.

```tsx
import { use } from 'react'

function UserList({ usersPromise }) {
  const users = use(usersPromise)
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

---

## 5. Security Boundary Mapping

Every feature MUST define its security boundaries. Use the following table format in your technical designs:

| Logic/Data Component | Location | Component Type | Rationale |
| :--- | :--- | :--- | :--- |
| **Auth Check** | Server | Middleware | Prevent data leakage at the entry point. |
| **DB Mutation** | Server | Server Function | Direct write access with validation. |
| **UI Toggle** | Client | Standard React | Dynamic state without SSR overhead. |
| **Local Settings** | Client | Standard React | Stored in `localStorage`, client-only. |

---

## 6. Architecture-Level Test Plan

Before implementation, define the testing strategy using this structure:

### BDD (Playwright) - Browser Behavior
- **Scenario**: User toggles sidebar.
- **Expected**: `aria-expanded` updates, layout shifts smoothly.
- **Immunity**: This test MUST NEVER be changed to accommodate a "missing feature" without prompting the user.

### TDD (Vitest) - Core Logic
- **Module**: `authZ.functions.ts`
- **Unit Test**: Verify that unauthorized users receive a `FORBIDDEN` error.
- **Integration Test**: Verify that Server Functions correctly interact with Appwrite mocks.

---

## 7. Best Practices Checklist

- [ ] **Is it interactive?** Wrap it in `<ClientOnly>` if it's a layout element like a Sidebar.
- [ ] **Does it touch a DB/Secret?** Move it to a `createServerFn`.
- [ ] **Is the loader too big?** Move heavy logic to a Server Function called by the loader.
- [ ] **Hydration Mismatch?** Check if you're reading `session`, `localstorage`, or `window` during the initial render.
- [ ] **Validation?** Use Zod validators on all Server Functions.
- [ ] **Import Protection?** Ensure server-only code is isolated in `.server.ts` or `.functions.ts` to trigger Vite's protection.
- [ ] **React 19 native?** Use `use(promise)` instead of `<Await>` where possible for cleaner code.
