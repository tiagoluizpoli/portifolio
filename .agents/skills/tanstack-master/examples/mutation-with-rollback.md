# TanStack Mutation with Optimistic Updates — Deep Dive

**Scenario**: Complete optimistic update lifecycle — success path, error path with rollback, and concurrent mutation handling.

---

## The Complete Pattern

```typescript
// Generic hook factory for optimistic CRUD mutations
function useOptimisticMutation<TItem extends { $id: string }, TInput>(options: {
  queryKey: readonly unknown[];
  mutationFn: (input: TInput) => Promise<TItem>;
  // How to optimistically apply the update before server responds
  applyOptimistic: (current: TItem[], input: TInput) => TItem[];
  // How to merge real server response into cache
  onSuccess?: (data: TItem, variables: TInput) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: options.mutationFn,

    onMutate: async (variables) => {
      // 1. Cancel any outgoing refetches to avoid race conditions
      await queryClient.cancelQueries({ queryKey: options.queryKey });

      // 2. Snapshot the current value for rollback
      const previousData = queryClient.getQueryData<TItem[]>(options.queryKey);

      // 3. Apply optimistic update immediately
      queryClient.setQueryData<TItem[]>(options.queryKey, current =>
        options.applyOptimistic(current ?? [], variables)
      );

      // 4. Return context (rollback data)
      return { previousData };
    },

    onError: (error, variables, context) => {
      // Rollback to snapshot on failure
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(options.queryKey, context.previousData);
      }
      console.error('[Mutation error]', error.message);
    },

    onSuccess: (data, variables) => {
      options.onSuccess?.(data, variables);
    },

    onSettled: () => {
      // Always refetch after mutation — ensures server state is truth
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    },
  });
}
```

---

## Example 1: Optimistic Create

```typescript
function useCreateItem() {
  const QUERY_KEY = ['items', 'list'] as const;

  return useOptimisticMutation({
    queryKey: QUERY_KEY,
    mutationFn: (input: CreateItemInput) => createItemFn({ data: input }),

    applyOptimistic: (current, input) => [
      // Add a temporary "pending" item at the top
      {
        $id: `temp-${Date.now()}`,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        ...input,
        _pending: true, // Flag for UI to show loading state
      } as Item & { _pending: boolean },
      ...current,
    ],
  });
}

// Component — show pending state in UI
function ItemsList() {
  const { data: items } = useSuspenseQuery(itemsQueryOptions());
  const createItem = useCreateItem();

  return (
    <ul>
      {items.map(item => (
        <li key={item.$id} style={{ opacity: (item as any)._pending ? 0.5 : 1 }}>
          <span>{item.title}</span>
          {(item as any)._pending && <Spinner size="sm" />}
        </li>
      ))}
    </ul>
  );
}
```

---

## Example 2: Optimistic Update

```typescript
function useUpdateItem(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateItemInput) =>
      updateItemFn({ data: { id: itemId, updates } }),

    onMutate: async (updates) => {
      const listKey = ['items', 'list'];
      const detailKey = ['items', 'detail', itemId];

      // Cancel refetches for both list and detail
      await Promise.all([
        queryClient.cancelQueries({ queryKey: listKey }),
        queryClient.cancelQueries({ queryKey: detailKey }),
      ]);

      // Snapshot both
      const previousList = queryClient.getQueryData<Item[]>(listKey);
      const previousDetail = queryClient.getQueryData<Item>(detailKey);

      // Update list optimistically
      queryClient.setQueryData<Item[]>(listKey, current =>
        current?.map(item => item.$id === itemId ? { ...item, ...updates } : item) ?? []
      );

      // Update detail optimistically
      queryClient.setQueryData<Item>(detailKey, current =>
        current ? { ...current, ...updates } : current
      );

      return { previousList, previousDetail };
    },

    onError: (_err, _vars, ctx) => {
      // Rollback both
      if (ctx?.previousList) queryClient.setQueryData(['items', 'list'], ctx.previousList);
      if (ctx?.previousDetail) queryClient.setQueryData(['items', 'detail', itemId], ctx.previousDetail);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['items', 'detail', itemId] });
    },
  });
}
```

---

## Example 3: Optimistic Delete with Undo

```typescript
function useDeleteItem() {
  const queryClient = useQueryClient();
  const [undoItem, setUndoItem] = useState<Item | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItemFn({ data: { id } }),

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['items', 'list'] });
      const previous = queryClient.getQueryData<Item[]>(['items', 'list']);
      const deletedItem = previous?.find(i => i.$id === deletedId);

      // Remove from cache immediately
      queryClient.setQueryData<Item[]>(['items', 'list'], current =>
        current?.filter(i => i.$id !== deletedId) ?? []
      );

      // Store for undo
      if (deletedItem) setUndoItem(deletedItem);

      return { previous, deletedItem };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['items', 'list'], ctx.previous);
      setUndoItem(null);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: ['items', 'list'] }),
  });

  const undo = useMutation({
    mutationFn: () => restoreItemFn({ data: { id: undoItem!.$id } }),
    onSuccess: () => {
      setUndoItem(null);
      queryClient.invalidateQueries({ queryKey: ['items', 'list'] });
    },
  });

  return { deleteMutation, undoItem, undo };
}

// Usage with toast notification
function ItemActions({ item }: { item: Item }) {
  const { deleteMutation, undoItem, undo } = useDeleteItem();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteMutation.mutate(item.$id, {
      onSuccess: () => {
        toast({
          title: `"${item.title}" deleted`,
          action: (
            <Button variant="ghost" size="sm" onClick={() => undo.mutate()}>
              Undo
            </Button>
          ),
          duration: 5000, // 5 seconds to undo
        });
      },
    });
  };

  return <Button variant="destructive" onClick={handleDelete}>Delete</Button>;
}
```

---

## Example 4: Concurrent Mutation Safety

When multiple mutations can happen simultaneously:

```typescript
// Problem: User edits item, saves, then immediately edits again
// Old mutation response could overwrite new optimistic update

// Solution: Use mutation variables in onSuccess to verify relevance
function useSafeUpdate() {
  const queryClient = useQueryClient();
  let latestVariables: UpdateItemInput | null = null;

  return useMutation({
    mutationFn: async (input: UpdateItemInput) => {
      latestVariables = input;
      return updateItemFn({ data: input });
    },

    onSuccess: (data, variables) => {
      // Only apply server response if it matches the LATEST mutation
      if (variables === latestVariables) {
        queryClient.setQueryData(['items', 'detail', data.$id], data);
      }
      // Otherwise, the latest optimistic update is already correct
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
```

---

## Optimistic Update Decision Tree

```
Should I use optimistic updates?

Is the mutation likely to succeed? (>95% of the time)
  NO → Don't optimize — show loading state, wait for server
  YES ↓

Can I compute the resulting state from the mutation input?
  NO → Don't optimize — server might transform the data
  YES ↓

Is the user sensitive to latency here? (drag-sort, toggle, quick edit)
  NO → Skip — loading spinner is fine
  YES ↓

→ Implement optimistic update with full rollback
```
