# TanStack Auth Flow — Complete Example

**Scenario**: Full authentication cycle — login, session persistence, middleware protection, OAuth, logout, and password reset.

---

## Auth Architecture Overview

```
Login Page
  → loginFn (server function)
    → Appwrite createEmailPasswordSession
    → Set HttpOnly session cookie
  → Redirect to /dashboard

Protected Route
  → requireAuthMiddleware (beforeLoad)
    → Appwrite account.get()
    → Success: context.user populated → render route
    → Fail: redirect to /login?reason=unauthorized

Dashboard
  → User displayed from context.user
  → Logout button → logoutFn
    → Appwrite deleteSession('current')
    → Clear cookie
    → React Query: queryClient.clear()
  → Redirect to /login
```

---

## Server Functions

```typescript
// src/functions/auth.functions.ts

const LoginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// --- LOGIN ---
export const loginFn = createServerFn({ method: 'POST' })
  .validator(LoginSchema)
  .handler(async ({ data }) => {
    const { account } = createAdminClient();

    let session: Models.Session;
    try {
      session = await account.createEmailPasswordSession(data.email, data.password);
    } catch (error) {
      if (error instanceof AppwriteException) {
        switch (error.code) {
          case 401: throw new Error('Invalid email or password');
          case 429: throw new Error('Too many attempts. Please wait a moment.');
          default:  throw new Error('Sign in failed. Please try again.');
        }
      }
      throw error;
    }

    setCookie('session', session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { userId: session.userId };
  });

// --- LOGOUT ---
export const logoutFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    const { account } = createSessionClient();
    try {
      await account.deleteSession('current');
    } catch {
      // Session may already be expired — still clear cookie
    }
    deleteCookie('session');
  });

// --- GET CURRENT USER (for middleware) ---
export const getCurrentUserFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { account } = createSessionClient();
    const user = await account.get(); // Throws 401 if not authenticated
    return {
      $id: user.$id,
      name: user.name,
      email: user.email,
      emailVerification: user.emailVerification,
    };
  });

// --- OAUTH URL ---
export const getOAuthUrlFn = createServerFn({ method: 'GET' })
  .validator(z.object({ provider: z.enum(['google', 'github']) }))
  .handler(async ({ data }) => {
    const { account } = createAdminClient();
    const providers = { google: OAuthProvider.Google, github: OAuthProvider.Github };
    return account.createOAuth2Token(
      providers[data.provider],
      `${process.env.APP_URL}/auth/callback`,
      `${process.env.APP_URL}/login?error=oauth_failed`
    );
  });

// --- OAUTH CALLBACK ---
export const oauthCallbackFn = createServerFn({ method: 'POST' })
  .validator(z.object({ userId: z.string(), secret: z.string() }))
  .handler(async ({ data }) => {
    const { account } = createAdminClient();
    const session = await account.createSession(data.userId, data.secret);
    setCookie('session', session.secret, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', path: '/', maxAge: 60 * 60 * 24 * 30,
    });
  });

// --- REQUEST PASSWORD RESET ---
export const requestResetFn = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const { account } = createAdminClient();
    try {
      await account.createRecovery(data.email, `${process.env.APP_URL}/reset-password`);
    } catch {
      // Intentionally swallow — never reveal whether email exists
    }
    return { message: 'If that email is registered, a reset link has been sent.' };
  });

// --- COMPLETE PASSWORD RESET ---
export const completeResetFn = createServerFn({ method: 'POST' })
  .validator(z.object({
    userId: z.string(), secret: z.string(),
    newPassword: z.string().min(8),
  }))
  .handler(async ({ data }) => {
    const { account } = createAdminClient();
    await account.updateRecovery(data.userId, data.secret, data.newPassword);
  });
```

---

## Auth Middleware

```typescript
// src/middleware/auth.ts
export const requireAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const { account } = createSessionClient();
  let user: Awaited<ReturnType<typeof getCurrentUserFn>>;
  try {
    user = await getCurrentUserFn();
  } catch {
    throw redirect({ to: '/login', search: { reason: 'unauthorized' } });
  }
  return next({ context: { user } });
});

// Optional: verified email required
export const requireVerifiedMiddleware = createMiddleware().server(async ({ next, context }) => {
  if (!context.user.emailVerification) {
    throw redirect({ to: '/verify-email' });
  }
  return next();
});
```

---

## Login Page Component

```tsx
// src/routes/login.tsx
const LoginSearchSchema = z.object({
  reason: z.enum(['unauthorized', 'session_expired', 'oauth_failed']).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/login')({
  validateSearch: LoginSearchSchema,
  component: LoginPage,
});

function LoginPage() {
  const { reason, redirect: redirectTo } = Route.useSearch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const REASON_MESSAGES: Record<string, string> = {
    unauthorized:    'Please sign in to continue.',
    session_expired: 'Your session expired. Please sign in again.',
    oauth_failed:    'OAuth sign in failed. Please try again.',
  };

  const login = useMutation({
    mutationFn: (data: z.infer<typeof LoginSchema>) => loginFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries(); // Clear stale data from previous session
      router.navigate({ to: redirectTo ?? '/dashboard' });
    },
  });

  const oauthLogin = useMutation({
    mutationFn: (provider: 'google' | 'github') => getOAuthUrlFn({ data: { provider } }),
    onSuccess: (url) => { window.location.href = url; },
  });

  return (
    <main>
      {reason && <Alert variant="info">{REASON_MESSAGES[reason]}</Alert>}
      {login.error && <Alert variant="destructive">{login.error.message}</Alert>}

      <LoginForm onSubmit={login.mutate} isLoading={login.isPending} />

      <div>
        <Button onClick={() => oauthLogin.mutate('google')} loading={oauthLogin.isPending}>
          Continue with Google
        </Button>
        <Button onClick={() => oauthLogin.mutate('github')} loading={oauthLogin.isPending}>
          Continue with GitHub
        </Button>
      </div>

      <Link to="/forgot-password">Forgot your password?</Link>
    </main>
  );
}
```

---

## OAuth Callback Handler

```tsx
// src/routes/auth/callback.tsx
const CallbackSearchSchema = z.object({
  userId: z.string().optional(),
  secret: z.string().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute('/auth/callback')({
  validateSearch: CallbackSearchSchema,
  loader: async ({ search }) => {
    if (search.error || !search.userId || !search.secret) {
      throw redirect({ to: '/login', search: { reason: 'oauth_failed' } });
    }
    await oauthCallbackFn({ data: { userId: search.userId, secret: search.secret } });
    throw redirect({ to: '/dashboard' });
  },
  component: () => <LoadingSpinner />, // Briefly shown during redirect
});
```

---

## Logout Button

```tsx
export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = useMutation({
    mutationFn: () => logoutFn(),
    onSuccess: () => {
      queryClient.clear(); // Remove all cached data from previously logged-in user
      router.navigate({ to: '/login' });
    },
  });

  return (
    <Button
      variant="ghost"
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
    >
      {logout.isPending ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
```
