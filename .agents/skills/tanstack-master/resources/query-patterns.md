# TanStack Query Patterns — React Query Integration

---

## Core Concepts in This Stack

TanStack Start uses TanStack Router + TanStack Query together. The key contract:

1. **Route loaders** call `queryClient.ensureQueryData(queryOptions)` → populates cache on server
2. **Components** call `useSuspenseQuery(queryOptions)` → reads from cache instantly (no loading state)
3. **Mutations** write via server functions → call `queryClient.invalidateQueries()` → re-fetches

---

## Pattern 1: queryOptions Factory (The Most Important Pattern)

Always define query options as a factory function. This ensures the key and fetcher are always in sync.

```typescript
import { queryOptions, keepPreviousData } from '@tanstack/react-query';

// --- SINGLE ENTITY ---
export const itemQueryOptions = (id: ItemId) =>
  queryOptions({
    queryKey: ['items', 'detail', id],
    queryFn: () => getItemFn({ data: { id } }),
    staleTime: 5 * 60 * 1000,       // Fresh for 5 minutes
    gcTime: 10 * 60 * 1000,         // Keep 10 minutes after last use
  });

// --- LIST ---
export const itemsQueryOptions = (filters: ItemFilters = {}) =>
  queryOptions({
    queryKey: ['items', 'list', filters],
    queryFn: () => listItemsFn({ data: filters }),
    staleTime: 60 * 1000,            // Fresh for 1 minute
    placeholderData: keepPreviousData, // Don't show spinner on filter change
  });

// --- DEPENDENT QUERY (only runs when id is available) ---
export const itemOwnerQueryOptions = (item: Item | undefined) =>
  queryOptions({
    queryKey: ['profile', item?.ownerId],
    queryFn: () => getProfileFn({ data: { ownerId: item!.ownerId } }),
    enabled: !!item?.ownerId,         // Won't run until item is loaded
    staleTime: 10 * 60 * 1000,
  });
```

---

## Pattern 2: useSuspenseQuery — The Primary Read Pattern

```tsx
// ROUTE FILE: populate the cache on the server
export const Route = createFileRoute('/admin/items')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(itemsQueryOptions()),

  component: ItemsRoute,
});

// COMPONENT: reads synchronously from populated cache
function ItemsRoute() {
  // data is GUARANTEED to be defined — no undefined check needed
  const { data: items } = useSuspenseQuery(itemsQueryOptions());

  return <ItemsList items={items} />;
}

// For child components that read the same query (no duplicate fetch):
function ItemCount() {
  const { data: items } = useSuspenseQuery(itemsQueryOptions());
  // React Query deduplicates — no extra request made
  return <span>{items.total} items</span>;
}
```

---

## Pattern 3: Parallel Suspense Queries

```tsx
// Read from two queries simultaneously — both populated by loader
function DashboardOverview() {
  const [
    { data: profile },
    { data: stats },
  ] = useSuspenseQueries({
    queries: [
      profileQueryOptions(),
      statsQueryOptions(),
    ],
  });

  return (
    <div>
      <ProfileSection profile={profile} />
      <StatsGrid stats={stats} />
    </div>
  );
}

// In the loader — parallel prefetch:
loader: async ({ context: { queryClient } }) => {
  await Promise.all([
    queryClient.ensureQueryData(profileQueryOptions()),
    queryClient.ensureQueryData(statsQueryOptions()),
  ]);
},
```

---

## Pattern 4: Infinite Query (Cursor Pagination)

```tsx
export const infiniteItemsQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: ['items', 'infinite'],
    queryFn: ({ pageParam }) => listItemsPageFn({ data: { cursor: pageParam } }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 60 * 1000,
  });

// Component
function InfiniteItemsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery(infiniteItemsQueryOptions());

  const items = data?.pages.flatMap(page => page.items) ?? [];

  // IntersectionObserver for auto-load-on-scroll
  const observerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = observerRef.current;
    if (!el || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div>
      {items.map(item => <ItemCard key={item.$id} item={item} />)}
      <div ref={observerRef}>
        {isFetchingNextPage && <LoadingSpinner />}
        {!hasNextPage && items.length > 0 && <p>All items loaded</p>}
      </div>
    </div>
  );
}
```

---

## Pattern 5: Stale-While-Revalidate with Background Refresh

```typescript
// For data that's shown immediately but refreshes quietly
export const notificationsQueryOptions = () =>
  queryOptions({
    queryKey: ['notifications'],
    queryFn: () => getNotificationsFn(),
    staleTime: 0,              // Always consider stale
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchInterval: 60 * 1000, // Poll every minute (for real-time feel)
  });
```

---

## Pattern 6: Prefetching on Hover

```tsx
// Prefetch item data when user hovers over a list item
function ItemListEntry({ itemId }: { itemId: ItemId }) {
  const queryClient = useQueryClient();

  const prefetchItem = () => {
    queryClient.prefetchQuery(itemQueryOptions(itemId));
  };

  return (
    <li onMouseEnter={prefetchItem}>
      <Link
        to="/admin/items/$itemId"
        params={{ itemId }}
      >
        View Item
      </Link>
    </li>
  );
}
```

---

## Pattern 7: Selective Invalidation

```typescript
// After mutations, invalidate precisely to avoid over-fetching

export const queryKeys = {
  items: {
    all:      () => ['items'] as const,
    lists:    () => ['items', 'list'] as const,
    list:     (f: ItemFilters) => ['items', 'list', f] as const,
    detail:   (id: ItemId) => ['items', 'detail', id] as const,
    infinite: () => ['items', 'infinite'] as const,
  },
  profile: {
    all:   () => ['profile'] as const,
    data:  () => ['profile', 'data'] as const,
  },
} as const;

// Scenarios:

// After CREATE: invalidate all lists (new item may appear anywhere)
queryClient.invalidateQueries({ queryKey: queryKeys.items.lists() });
queryClient.invalidateQueries({ queryKey: queryKeys.items.infinite() });

// After UPDATE: invalidate just the specific detail + affected lists
queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(updatedId) });
queryClient.invalidateQueries({ queryKey: queryKeys.items.lists() });

// After DELETE: remove from cache + invalidate lists
queryClient.removeQueries({ queryKey: queryKeys.items.detail(deletedId) });
queryClient.invalidateQueries({ queryKey: queryKeys.items.lists() });

// Nuclear option (use sparingly — refetches everything):
queryClient.invalidateQueries({ queryKey: queryKeys.items.all() });
```

---

## Pattern 8: Error Recovery and Retry Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,

      // Smart retry: don't retry auth errors, retry network errors
      retry: (failureCount, error) => {
        if (error instanceof Error) {
          if (error.message.includes('401')) return false; // Auth error
          if (error.message.includes('403')) return false; // Permission error
          if (error.message.includes('404')) return false; // Not found
        }
        return failureCount < 2; // Retry up to 2 times for other errors
      },

      retryDelay: (attempt) => Math.min(500 * Math.pow(2, attempt), 10_000),
    },

    mutations: {
      retry: false, // NEVER retry mutations — dangerous (could double-submit)
    },
  },
});
```
