# TanStack Full CRUD Route — Complete Example

**Scenario**: A `Posts` feature — list, create, edit, delete with optimistic updates.

---

## File Structure

```
src/routes/
├── posts/
│   ├── route.tsx          ← Shell layout + list
│   ├── new.tsx            ← Create form
│   └── $postId/
│       ├── edit.tsx       ← Edit form
│       └── route.tsx      ← Post detail
```

---

## Server Functions

```typescript
// src/functions/posts.functions.ts
import { createServerFn } from '@tanstack/start';
import { z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title required').max(255),
  content: z.string().max(10000).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});
const UpdatePostSchema = CreatePostSchema.partial();

// LIST
export const listPostsFn = createServerFn({ method: 'GET' })
  .validator(z.object({ status: z.enum(['draft', 'published', 'all']).default('all') }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    const queries = [
      Query.equal('ownerId', user.$id),
      Query.isNull('deletedAt'),
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ];
    if (data.status !== 'all') queries.push(Query.equal('status', data.status));

    const result = await databases.listDocuments(DB_ID, POSTS_COLLECTION_ID, queries);
    return {
      posts: result.documents.map(d => PostSchema.parse(d)),
      total: result.total,
    };
  });

// GET ONE
export const getPostFn = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { databases } = createSessionClient();
    const doc = await databases.getDocument(DB_ID, POSTS_COLLECTION_ID, data.id);
    return PostSchema.parse(doc);
  });

// CREATE
export const createPostFn = createServerFn({ method: 'POST' })
  .validator(CreatePostSchema)
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    const doc = await databases.createDocument(
      DB_ID, POSTS_COLLECTION_ID, ID.unique(),
      { ...data, ownerId: user.$id },
      [Permission.read(Role.any()), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))]
    );
    return PostSchema.parse(doc);
  });

// UPDATE
export const updatePostFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), updates: UpdatePostSchema }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    const existing = await databases.getDocument(DB_ID, POSTS_COLLECTION_ID, data.id);
    if (existing['ownerId'] !== user.$id) throw new Error('Forbidden');

    const doc = await databases.updateDocument(DB_ID, POSTS_COLLECTION_ID, data.id, data.updates);
    return PostSchema.parse(doc);
  });

// SOFT DELETE
export const deletePostFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    const existing = await databases.getDocument(DB_ID, POSTS_COLLECTION_ID, data.id);
    if (existing['ownerId'] !== user.$id) throw new Error('Forbidden');

    await databases.updateDocument(DB_ID, POSTS_COLLECTION_ID, data.id, {
      deletedAt: new Date().toISOString(),
    });
  });
```

---

## Query Options

```typescript
// src/queries/posts.queries.ts
export const postsQueryOptions = (filters = {}) =>
  queryOptions({
    queryKey: ['posts', 'list', filters],
    queryFn: () => listPostsFn({ data: filters }),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

export const postQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['posts', 'detail', id],
    queryFn: () => getPostFn({ data: { id } }),
    staleTime: 5 * 60 * 1000,
  });
```

---

## List Route

```tsx
// src/routes/posts/route.tsx
export const Route = createFileRoute('/posts')({
  beforeLoad: requireAuthMiddleware,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQueryOptions()),
  pendingComponent: PostsListSkeleton,
  errorComponent: PostsErrorBoundary,
  component: PostsRoute,
});

function PostsRoute() {
  const { data } = useSuspenseQuery(postsQueryOptions());
  const queryClient = useQueryClient();

  const deletePost = useMutation({
    mutationFn: (id: string) => deletePostFn({ data: { id } }),

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['posts', 'list'] });
      const previous = queryClient.getQueryData<typeof data>(['posts', 'list', {}]);
      queryClient.setQueryData(['posts', 'list', {}], old =>
        old ? { ...old, posts: old.posts.filter(p => p.$id !== deletedId) } : old
      );
      return { previous };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['posts', 'list', {}], ctx.previous);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: ['posts', 'list'] }),
  });

  return (
    <PageLayout title="Posts" actions={<Link to="/posts/new"><Button>New Post</Button></Link>}>
      {data.posts.length === 0 ? (
        <EmptyState message="No posts yet" action="Create your first post" />
      ) : (
        <ul role="list" aria-label="Posts list">
          {data.posts.map(post => (
            <PostListItem
              key={post.$id}
              post={post}
              onDelete={() => deletePost.mutate(post.$id)}
              isDeleting={deletePost.variables === post.$id && deletePost.isPending}
            />
          ))}
        </ul>
      )}
    </PageLayout>
  );
}
```

---

## Create Route

```tsx
// src/routes/posts/new.tsx
export const Route = createFileRoute('/posts/new')({
  beforeLoad: requireAuthMiddleware,
  component: NewPostRoute,
});

function NewPostRoute() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createPost = useMutation({
    mutationFn: (data: CreatePostInput) => createPostFn({ data }),
    onSuccess: (newPost) => {
      // Invalidate list, then navigate to detail
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      router.navigate({ to: '/posts/$postId', params: { postId: newPost.$id } });
    },
  });

  return (
    <PostForm
      onSubmit={createPost.mutate}
      isSubmitting={createPost.isPending}
      error={createPost.error?.message}
    />
  );
}
```

---

## Edit Route

```tsx
// src/routes/posts/$postId/edit.tsx
export const Route = createFileRoute('/posts/$postId/edit')({
  beforeLoad: requireAuthMiddleware,
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(postQueryOptions(params.postId)),
  component: EditPostRoute,
});

function EditPostRoute() {
  const { postId } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: post } = useSuspenseQuery(postQueryOptions(postId));

  const updatePost = useMutation({
    mutationFn: (updates: UpdatePostInput) =>
      updatePostFn({ data: { id: postId, updates } }),

    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['posts', 'detail', postId] });
      const previous = queryClient.getQueryData(postQueryOptions(postId).queryKey);
      queryClient.setQueryData(postQueryOptions(postId).queryKey, old =>
        old ? { ...old, ...updates } : old
      );
      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(postQueryOptions(postId).queryKey, ctx.previous);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      router.navigate({ to: '/posts/$postId', params: { postId } });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'detail', postId] });
    },
  });

  return (
    <PostForm
      defaultValues={post}
      onSubmit={updatePost.mutate}
      isSubmitting={updatePost.isPending}
      error={updatePost.error?.message}
    />
  );
}
```
