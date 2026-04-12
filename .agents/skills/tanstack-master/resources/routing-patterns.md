# TanStack Routing Patterns — Advanced Reference

---

## Pattern 1: Nested Layouts (Pathless Routes)

```
routes/
├── _layout.tsx           ← Pathless: wraps children without affecting URL
│   ├── dashboard.tsx     → /dashboard
│   └── settings.tsx      → /settings
```

```tsx
// routes/_layout.tsx — Shell wrapper without URL segment
export const Route = createFileRoute('/_layout')({
  component: () => (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />  {/* dashboard or settings renders here */}
      </main>
    </div>
  ),
});
```

---

## Pattern 2: Dynamic Segments

```tsx
// routes/admin/posts/$postId.tsx
export const Route = createFileRoute('/admin/posts/$postId')({
  loader: async ({ params, context: { queryClient } }) => {
    // params.postId is type-safe (string)
    return queryClient.ensureQueryData(postDetailQueryOptions(params.postId as PostId));
  },

  component: function PostDetailRoute() {
    const { postId } = Route.useParams(); // Type-safe param access
    const post = useSuspenseQuery(postDetailQueryOptions(postId as PostId));
    return <PostDetail post={post.data} />;
  },
});
```

---

## Pattern 3: Search Params (Type-Safe URL State)

```tsx
import { z } from 'zod';

const PostsSearchSchema = z.object({
  category: z.enum(['all', 'news', 'tutorials', 'reviews']).default('all'),
  page: z.number().int().min(1).default(1),
  q: z.string().optional(),
});

export const Route = createFileRoute('/admin/posts')({
  validateSearch: PostsSearchSchema, // Validates URL search params

  loader: ({ context: { queryClient }, search }) =>
    queryClient.ensureQueryData(postsQueryOptions(search)), // search is typed

  component: function PostsRoute() {
    const search = Route.useSearch();              // Typed search params
    const navigate = Route.useNavigate();

    const setCategory = (category: string) =>
      navigate({ search: prev => ({ ...prev, category, page: 1 }) });

    return <PostsPage category={search.category} onCategoryChange={setCategory} />;
  },
});
```

---

## Pattern 4: Parallel Data Loading

```tsx
// Load multiple queries simultaneously in a single loader
export const Route = createFileRoute('/admin/dashboard')({
  loader: async ({ context: { queryClient } }) => {
    // Both start simultaneously — not sequential
    const [profile, stats] = await Promise.all([
      queryClient.ensureQueryData(profileQueryOptions()),
      queryClient.ensureQueryData(statsQueryOptions()),
    ]);
    return { profile, stats };
  },

  component: function DashboardRoute() {
    // Both are already in cache — instant access
    const profile = useSuspenseQuery(profileQueryOptions());
    const stats = useSuspenseQuery(statsQueryOptions());
    return <DashboardPage profile={profile.data} stats={stats.data} />;
  },
});
```

---

## Pattern 5: Route Guards / beforeLoad

```tsx
// Auth guard using beforeLoad
export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    const { account } = createSessionClient();
    try {
      const user = await account.get();
      return { user }; // Adds to context for loader and component
    } catch {
      throw redirect({ to: '/login' });
    }
  },

  // context.user is now typed and available to all child routes
  loader: ({ context }) => {
    console.log('Logged in as:', context.user.name);
  },
});
```

---

## Pattern 6: Infinitely Scrolling List

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const getItemsPageFn = createServerFn({ method: 'GET' })
  .validator(z.object({ cursor: z.string().optional(), limit: z.number().default(20) }))
  .handler(async ({ data }) => {
    const queries = [
      Query.limit(data.limit + 1),
      Query.orderDesc('$createdAt'),
    ];
    if (data.cursor) queries.push(Query.cursorAfter(data.cursor));
    const result = await databases.listDocuments(DB_ID, ITEMS_COLLECTION_ID, queries);
    const hasMore = result.documents.length > data.limit;
    return {
      items: result.documents.slice(0, data.limit).map(d => ItemSchema.parse(d)),
      nextCursor: hasMore ? result.documents[data.limit - 1].$id : null,
    };
  });

// Infinite query hook
function useInfiniteItems() {
  return useInfiniteQuery({
    queryKey: ['items', 'infinite'],
    queryFn: ({ pageParam }) => getItemsPageFn({ data: { cursor: pageParam } }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,
  });
}

// Component
function InfiniteItemsList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteItems();
  const items = data?.pages.flatMap(p => p.items) ?? [];

  return (
    <>
      {items.map(item => <ItemCard key={item.$id} item={item} />)}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </button>
      )}
    </>
  );
}
```

---

## Pattern 7: Catch-All Routes (404 Handling)

```tsx
// routes/$.tsx — Matches any unmatched route
export const Route = createFileRoute('/$')({
  component: () => (
    <div>
      <h1>404 — Page Not Found</h1>
      <Link to="/">Go home</Link>
    </div>
  ),
});
```

---

## Pattern 8: Route-Level Pending UI

```tsx
export const Route = createFileRoute('/admin/posts')({
  // Shows while loader is running
  pendingComponent: () => <PostsListSkeleton />,
  // Minimum time to show pending UI (prevents flash)
  pendingMinMs: 300,
  // Delay before showing pending UI (prevents flash for fast loads)
  pendingMs: 200,

  loader: async ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQueryOptions()),
});
```
