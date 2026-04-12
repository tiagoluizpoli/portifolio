# Server Components — Architecture Guide

React Server Components (RSC) allow rendering components on the server, sending only the result (not the component code) to the client.

---

## The Mental Model

```
Server Component (default) → Runs on the server. No hooks. No browser APIs. Can access DB directly.
Client Component ("use client") → Runs on both server (SSR) and client. Has hooks, event handlers, browser APIs.
```

**Default is Server.** You opt INTO client rendering, not out of it.

---

## The Boundary Rules

### Rule 1: Server components can import client components
```tsx
// ✅ Server component importing a client component
import { InteractiveChart } from './InteractiveChart' // has "use client"

export default function DashboardPage() {
  const data = await db.getMetrics() // Direct DB access — only possible in server component
  return <InteractiveChart data={data} /> // Pass serializable data
}
```

### Rule 2: Client components CANNOT import server components
```tsx
// ❌ This will NOT work
'use client'
import { ServerWidget } from './ServerWidget' // ERROR: Can't import server into client
```

### Rule 3: Client components CAN render server components via children
```tsx
// ✅ Server component passes server content as children to client wrapper
// layout.tsx (server)
import { ClientSidebar } from './ClientSidebar'
import { ServerNavItems } from './ServerNavItems'

export default function Layout({ children }) {
  return (
    <ClientSidebar>
      <ServerNavItems />  {/* Server component passed as children — works! */}
    </ClientSidebar>
  )
}
```

---

## Serialization Boundary

Props passed from server to client components MUST be serializable:

| ✅ Serializable | ❌ NOT Serializable |
|:---|:---|
| `string`, `number`, `boolean`, `null` | Functions, closures |
| `Date`, `Map`, `Set` (React enhances these) | Class instances |
| Arrays and plain objects | Symbols |
| React elements (`<Component />`) | DOM nodes |
| Promises (with `use()`) | Callbacks, event handlers |

```tsx
// ✅ Pass data, not behavior
<ClientChart data={metrics} title="Revenue" />

// ❌ Can't pass functions from server to client
<ClientChart data={metrics} onDrillDown={handleDrillDown} /> // ERROR
```

---

## "use server" — Server Actions

Server Actions are async functions that execute on the server, callable from client components.

```tsx
// actions.ts
'use server'

import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export async function createUser(formData: FormData) {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await db.users.create(parsed.data)
  revalidatePath('/users')
  return { success: true }
}
```

**Rules**:
1. Always validate inputs (never trust client data)
2. Always check authorization
3. Use Zod for validation (same schema as the client form)
4. Call `revalidatePath` or `revalidateTag` after mutations
5. Return structured results (not throw)

---

## Decision: Server or Client?

```
Does this component need:
  - Event handlers (onClick, onChange, onSubmit)?
  - Hooks (useState, useEffect, useRef)?
  - Browser APIs (window, localStorage, IntersectionObserver)?
  - Real-time updates (WebSocket, SSE)?
    → YES to any: "use client"
    → NO to all: Keep as Server Component (default)
```

**Typical Split**:
- **Server**: Layouts, pages, data-fetching wrappers, static content, navigation structure
- **Client**: Forms, modals, dropdowns, charts, real-time widgets, anything interactive

---

## Performance Implications

| Aspect | Server Component | Client Component |
|:---|:---|:---|
| Bundle size | Not included in client JS | Included in client JS |
| Data fetching | Direct DB/API access, no waterfall | Requires useEffect or Query library |
| Hydration | No hydration needed | Must hydrate on client |
| Interactivity | None | Full interactivity |
| SEO | Rendered HTML sent to client | Depends on SSR strategy |
