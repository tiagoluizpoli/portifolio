# TanStack Security Boundaries — Decision Framework

---

## The Security Boundary Model

In TanStack Start, every piece of code lives in one of three zones:

```
┌──────────────────────────────────────────────────────────────────┐
│  BROWSER ZONE                                                    │
│  ├── React components (client components)                        │
│  ├── Browser APIs (localStorage, navigator, etc.)               │
│  └── client-only hooks and state                                 │
├──────────────────────────────────────────────────────────────────┤
│  SHARED ZONE (SSR: runs on both server and browser)             │
│  ├── Route components (first render on server, hydrated in browser)│
│  ├── useSuspenseQuery (server-populated, client-maintained)      │
│  └── Shared utilities (formatters, validators)                   │
├──────────────────────────────────────────────────────────────────┤
│  SERVER ZONE (never ships to browser)                            │
│  ├── Route loaders                                               │
│  ├── Server functions (.functions.ts, .server.ts)              │
│  ├── Middleware                                                  │
│  └── Direct database/storage access                             │
└──────────────────────────────────────────────────────────────────┘
```

**The critical rule**: Secrets, database access, and auth checks MUST stay in the server zone. Vite enforces this at build time for `.server.ts` files, but you are responsible for not importing server code into client components.

---

## Security Boundary Decision Matrix

Use this for every piece of logic you write:

| Logic Type | Zone | Rationale |
|:---|:---|:---|
| Auth check (does user have session?) | Server | Session secret must never reach browser |
| Auth check UI (show/hide login button) | Client | Cosmetic only — server still enforces |
| Database query | Server | DB credentials server-only |
| Environment secrets | Server | Never in client bundle |
| Form validation (user feedback) | Both | Run on client for UX, repeat on server for safety |
| Business rule enforcement | Server | Client-side rules can be bypassed |
| Ownership check | Server | Must be authoritative |
| Permission check | Server | Must be authoritative |
| Display logic (conditional UI) | Client | No security impact |
| Analytics / tracking | Client | Browser APIs only |
| File upload | Server | Validate + store server-side |

---

## Common Security Mistakes

### Mistake 1: Auth Check in Client Component Only

```tsx
// ❌ INSECURE: Client-side auth check only
function DeleteButton({ itemId, ownerId }: { itemId: string; ownerId: string }) {
  const { user } = useAuth();
  // Attacker can set user.id to match ownerId in the browser
  if (user?.id !== ownerId) return null; // Just hides the button — doesn't protect the API

  return <button onClick={() => deleteItemFn({ data: { id: itemId } })}>Delete</button>;
}

// The mutationFn ALSO needs an ownership check on the server:
export const deleteItemFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get(); // Real auth — cannot be bypassed

    const item = await databases.getDocument(DB_ID, COLLECTION_ID, data.id);
    if (item['ownerId'] !== user.$id) throw new Error('Forbidden'); // Real ownership check

    await databases.deleteDocument(DB_ID, COLLECTION_ID, data.id);
  });

// ✅ CORRECT: Client check for UX, server check for security
function DeleteButton({ itemId, ownerId }: { itemId: string; ownerId: string }) {
  const { user } = useAuth();
  if (user?.id !== ownerId) return null; // UX: hide the button

  return <button onClick={() => deleteItemFn({ data: { id: itemId } })}>Delete</button>;
  // Server rejects the call anyway if ownership doesn't match
}
```

---

### Mistake 2: Database Access in Client Component

```tsx
// ❌ INSECURE: Client component importing SDK directly
import { databases } from '../lib/appwrite'; // This ends up in the browser bundle!

function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    // This runs in the browser with client credentials — exposes your DB to the browser
    databases.listDocuments(DB_ID, USERS_COLLECTION).then(r => setUsers(r.documents));
  }, []);
  return <ul>{users.map(u => <li key={u.$id}>{u.name}</li>)}</ul>;
}

// ✅ CORRECT: Data fetched via server function → React Query
const getUsersFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { databases } = createSessionClient(); // Server-only
    const result = await databases.listDocuments(DB_ID, USERS_COLLECTION, [...]);
    return result.documents.map(d => UserSchema.parse(d));
  });

function UserList() {
  const { data: users } = useSuspenseQuery({
    queryKey: ['users'],
    queryFn: () => getUsersFn(),
  });
  return <ul>{users.map(u => <li key={u.$id}>{u.name}</li>)}</ul>;
}
```

---

### Mistake 3: API Key in Client Code

```typescript
// ❌ CRITICAL: API key in shared/client code
const client = new Client()
  .setKey(process.env.VITE_APPWRITE_API_KEY!); // VITE_ prefix = exposed to browser bundle

// ✅ CORRECT: Admin client only in server-side files
// apps/server/lib/admin-client.ts (.server.ts or used only in server functions)
export const createAdminClient = () => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!); // No VITE_ prefix — server only
  return { databases: new Databases(client), storage: new Storage(client) };
};
```

---

### Mistake 4: Trusting Client-Provided IDs Without Verification

```typescript
// ❌ INSECURE: Using client-provided userId directly
export const updateProfileFn = createServerFn({ method: 'POST' })
  .validator(z.object({ userId: z.string(), data: ProfileUpdateSchema }))
  .handler(async ({ data }) => {
    // Attacker can provide any userId — updating other users' profiles!
    await databases.updateDocument(DB_ID, PROFILES_COLLECTION, data.userId, data.data);
  });

// ✅ CORRECT: Get userId from authenticated session — never trust client
export const updateProfileFn = createServerFn({ method: 'POST' })
  .validator(ProfileUpdateSchema) // Only accept data, not userId
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get(); // Authoritative userId from session
    await databases.updateDocument(DB_ID, PROFILES_COLLECTION, user.$id, data);
  });
```

---

## Security Checklist — Per Server Function

Before every server function ships:

```
Auth & Identity
  ✅ account.get() called at the top of every authenticated handler?
  ✅ userId taken from account.get(), not from input?
  ✅ Admin operations use team membership check, not a client-provided flag?

Validation
  ✅ .validator(ZodSchema) applied before handler?
  ✅ Input strings sanitized / length-limited?
  ✅ File uploads validated for size AND type?
  ✅ URL redirects validated as relative-only paths?

Authorization
  ✅ Ownership verified before update/delete?
  ✅ Document-level Appwrite permissions set on createDocument?
  ✅ Admin client only used for privileged background operations?

Output
  ✅ Error messages don't expose internal structure?
  ✅ No secrets, keys, or session tokens in response?
  ✅ Zod schema applied to response (parse before return)?
  ✅ console.log doesn't include sensitive data?
```

---

## Route Guard Patterns

```typescript
// Guard 1: Require authentication — redirect unauthorized users
export const requireAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const { account } = createSessionClient();
  try {
    const user = await account.get();
    return next({ context: { user } });
  } catch {
    throw redirect({ to: '/login', search: { reason: 'unauthorized' } });
  }
});

// Guard 2: Require specific team membership
export const requireTeamMiddleware = (teamId: string) =>
  createMiddleware().server(async ({ next, context }) => {
    const { teams } = createSessionClient();
    const memberships = await teams.listMemberships();
    const isMember = memberships.memberships.some(m => m.teamId === teamId);
    if (!isMember) throw redirect({ to: '/unauthorized' });
    return next();
  });

// Guard 3: Require verified email
export const requireVerifiedMiddleware = createMiddleware().server(async ({ next, context }) => {
  if (!context.user.emailVerification) {
    throw redirect({ to: '/verify-email' });
  }
  return next();
});

// Composing guards on a route:
export const Route = createFileRoute('/admin')({
  beforeLoad: [requireAuthMiddleware, requireTeamMiddleware('admin')],
  loader: async ({ context }) => { /* context.user is typed */ },
});
```
