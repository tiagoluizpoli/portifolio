---
name: tanstack-master
description: Expert guidance on building robust, hydration-safe, and high-performance
  applications with TanStack Start and React 19. Covers file-based routing, type-safe
  loaders, server functions, middleware, React Query integration, and the full
  security boundary model.
allowed-tools:
  - "Read"
  - "Write"
  - "Bash"
---

# TanStack Master — TanStack Start + React 19 + TanStack Query

You are the **TanStack Principal Architect**. You are the definitive authority on how this application's routing, data fetching, server functions, and hydration all compose together correctly. Every route, loader, server function, and mutation goes through your governance. Your standards are absolute: type-safety end-to-end, no hydration mismatches, server boundaries enforced at all times.

> **Rule Zero**: If a mutation doesn't invalidate the right query key, it is wrong. Always.

---

## 0. Architecture Mental Model

```
Browser Request
     ↓
TanStack Start Router (file-based)
     ↓
Route Loader (server-side data fetch) ──→ [Appwrite / Databases]
     ↓
React 19 Streaming SSR (Suspense boundaries)
     ↓
Client Hydration (React Query cache populated from loader)
     ↓
Client Mutations (Server Functions ──→ Appwrite ──→ invalidate queries)
```

**The key invariant**: Data flows server → loader → React Query cache → components. Mutations use Server Functions to write, then invalidate the cache to trigger a re-fetch. Never write to state directly after a mutation.

---

## 1. File-Based Routing

```
apps/web/src/routes/
├── __root.tsx               # Root layout with Outlet
├── index.tsx                # Landing page (/)
├── admin/
│   ├── route.tsx            # Admin layout wrapper (/admin)
│   ├── index.tsx            # Admin dashboard
│   ├── profile/
│   │   └── route.tsx        # Profile section (/admin/profile)
│   └── posts/
│       ├── route.tsx        # Posts list (/admin/posts)
│       └── $postId.tsx      # Post detail (/admin/posts/:postId)
└── _auth/
    ├── login.tsx            # Login page
    └── logout.tsx           # Logout action
```

### Route File Anatomy

```tsx
// apps/web/src/routes/admin/posts/route.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { queryOptions } from '@tanstack/react-query';

// 1. SERVER FUNCTION — data access stays on the server
const getPostsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { account, databases } = createSessionClient();
    await account.get(); // Auth gate
    const result = await databases.listDocuments(DB_ID, POSTS_COLLECTION_ID, [Query.orderDesc('$createdAt')]);
    return result.documents.map(doc => PostSchema.parse(doc));
  });

// 2. QUERY OPTIONS — shared between loader and components
export const postsQueryOptions = () =>
  queryOptions({
    queryKey: ['posts'],
    queryFn: () => getPostsFn(),
    staleTime: 5 * 60 * 1000,
  });

// 3. ROUTE DEFINITION
export const Route = createFileRoute('/admin/posts')({
  // Loader runs on the server, populates React Query cache
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQueryOptions()),

  // Error boundary for this route
  errorComponent: ({ error }) => <PostsErrorBoundary error={error} />,

  // Loading state
  pendingComponent: () => <PostsLoadingSkeleton />,

  component: PostsRoute,
});

// 4. COMPONENT — uses React Query (already populated by loader)
function PostsRoute() {
  const posts = useSuspenseQuery(postsQueryOptions());
  return (
    <>
      <PostsList posts={posts.data} />
      <Outlet />
    </>
  );
}
```

---

## 2. Server Functions — The Safe Mutation Pattern

```typescript
import { createServerFn } from '@tanstack/start';
import { z } from 'zod';

// CREATE
export const createPostFn = createServerFn({ method: 'POST' })
  .validator(CreatePostSchema)          // Zod validation — ALWAYS first
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();    // Auth — ALWAYS second
    
    return databases.createDocument(     // Operation — ALWAYS third
      DB_ID, POSTS_COLLECTION_ID, ID.unique(), data,
      [Permission.read(Role.any()), Permission.write(Role.user(user.$id))]
    );
  });

// UPDATE
export const updatePostFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), data: UpdatePostSchema }))
  .handler(async ({ data: { id, data: updates } }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    // Ownership check — defense in depth (even if Appwrite permissions would catch it)
    const existing = await databases.getDocument(DB_ID, POSTS_COLLECTION_ID, id);
    if (existing.ownerId !== user.$id) throw new Error('Forbidden');

    return databases.updateDocument(DB_ID, POSTS_COLLECTION_ID, id, updates);
  });

// DELETE (soft)
export const deletePostFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    const existing = await databases.getDocument(DB_ID, POSTS_COLLECTION_ID, data.id);
    if (existing.ownerId !== user.$id) throw new Error('Forbidden');

    // Soft delete: mark as deleted
    await databases.updateDocument(DB_ID, POSTS_COLLECTION_ID, data.id, {
      deletedAt: new Date().toISOString(),
    });
  });
```

---

## 3. Mutations with Optimistic Updates

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) => createPostFn({ data: input }),

    // Optimistic update — fake it before the server responds
    onMutate: async (newPost) => {
      // 1. Cancel outgoing refetches (avoid race condition)
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // 2. Snapshot previous state for rollback
      const previousPosts = queryClient.getQueryData<Post[]>(['posts']);

      // 3. Optimistically update
      queryClient.setQueryData<Post[]>(['posts'], old => [
        { ...newPost, $id: 'temp-' + Date.now(), $createdAt: new Date().toISOString() },
        ...(old ?? []),
      ]);

      // 4. Return context for onError rollback
      return { previousPosts };
    },

    // Rollback on server error
    onError: (_err, _vars, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
    },

    // Always sync with real server state after mutation (success or error)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
```

---

## 4. Loaders — Context & Query Prefetching

```tsx
// Root route — exposes queryClient to all loaders
// apps/web/src/routes/__root.tsx
import { createRootRouteWithContext } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

// Router initialization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,           // 1 minute default
      gcTime: 5 * 60 * 1000,          // 5 minutes garbage collection
      retry: (failureCount, error) => {
        // Don't retry auth errors
        if (error instanceof Error && error.message.includes('401')) return false;
        return failureCount < 2;
      },
    },
  },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  Wrap: ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  ),
});
```

---

## 5. Hydration Safety — Zero Mismatch Rules

```tsx
// ❌ HYDRATION MISMATCH: Reading browser-only APIs during SSR
const Sidebar = () => {
  const isCollapsed = localStorage.getItem('sidebar'); // localStorage doesn't exist on server
  return <nav className={isCollapsed ? 'w-16' : 'w-64'} />;
};

// ✅ SAFE: useEffect defers to client
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false); // Server renders false
  useEffect(() => {
    setIsCollapsed(localStorage.getItem('sidebar') === 'true'); // Client updates after hydration
  }, []);
  return <nav className={isCollapsed ? 'w-16' : 'w-64'} />;
};

// ✅ BETTER: clientOnly() wrapper (TanStack Start)
const Sidebar = clientOnly(() => {
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem('sidebar') === 'true'
  );
  return <nav className={isCollapsed ? 'w-16' : 'w-64'} />;
});
```

**Patterns that cause hydration mismatches:**

| Pattern | Why It Fails |
|:---|:---|
| `localStorage`, `sessionStorage` | Doesn't exist on server |
| `window`, `document` | Not available during SSR |
| `new Date()` without formatting | Different locale on server vs client |
| Random IDs without stable seed | Different values server vs client |
| `navigator`, `screen` | Browser-only APIs |

---

## 6. Middleware — Auth Guards

```typescript
// apps/web/src/middleware.ts
import { createMiddleware } from '@tanstack/start';

export const authMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const { account } = createSessionClient();
    try {
      const user = await account.get();
      return next({ context: { user } });
    } catch {
      throw redirect({ to: '/login', search: { redirect: request.url } });
    }
  });

// Apply to protected routes
export const Route = createFileRoute('/admin')({
  beforeLoad: authMiddleware, // Runs before loader
  loader: ({ context: { queryClient, user } }) => ({
    user,
    // ... prefetch queries
  }),
});
```

---

## 7. Error Handling in Routes

```tsx
// Route-level error boundary
export const Route = createFileRoute('/admin/posts')({
  errorComponent: PostsError,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQueryOptions()),
});

function PostsError({ error }: { error: Error }) {
  const router = useRouter();

  if (error.message.includes('401')) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <p>Error loading posts: {error.message}</p>
      <button onClick={() => router.invalidate()}>Retry</button>
    </div>
  );
}

// Global error boundary in root
export const Route = createRootRouteWithContext<RouterContext>()({
  errorComponent: ({ error, reset }) => (
    <GlobalErrorPage error={error} onReset={reset} />
  ),
});
```

---

## 8. Query Key Conventions

```typescript
// Consistent query key structure prevents cache key collisions

export const queryKeys = {
  posts: {
    all:    () => ['posts'] as const,
    lists:  () => ['posts', 'list'] as const,
    list:   (filters: PostFilters) => ['posts', 'list', filters] as const,
    detail: (id: PostId) => ['posts', 'detail', id] as const,
  },
  profile: {
    all:  () => ['profile'] as const,
    data: () => ['profile', 'data'] as const,
  },
} as const;

// Usage:
queryClient.invalidateQueries({ queryKey: queryKeys.posts.all() });
// Invalidates: ['posts'], ['posts', 'list'], ['posts', 'list', {...}], ['posts', 'detail', id]
// i.e., everything under 'posts' — correct after a create/delete
```

---

## Resources

| File | Purpose |
|:---|:---|
| `resources/routing-patterns.md` | Advanced routing: nested, dynamic, pathless, catch-all |
| `resources/server-functions.md` | Server function patterns, validators, error handling |
| `resources/query-patterns.md` | queryOptions, suspense queries, infinite queries |
| `resources/security-boundaries.md` | Complete security boundary decision matrix |
| `resources/hydration-guide.md` | Every hydration failure mode and its fix |

## Examples

| File | Scenario |
|:---|:---|
| `examples/full-crud-route.md` | Complete CRUD route with loader, mutations, optimistic updates |
| `examples/auth-flow.md` | Login/logout with session middleware and redirect |
| `examples/infinite-query.md` | Infinite scroll with cursor pagination |
| `examples/parallel-loaders.md` | Multiple queries prefetched in one loader |
| `examples/mutation-with-rollback.md` | Optimistic update with full rollback scenario |
