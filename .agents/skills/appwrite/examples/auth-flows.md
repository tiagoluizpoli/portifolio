# Appwrite Auth Flows — Complete Examples

---

## Flow 1: Email/Password Login with Session Persistence

```typescript
// apps/cms/src/routes/login.tsx

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginFn = createServerFn({ method: 'POST' })
  .validator(LoginSchema)
  .handler(async ({ data }) => {
    const { account } = createAdminClient(); // Admin for creating sessions

    let session: Models.Session;
    try {
      session = await account.createEmailPasswordSession(data.email, data.password);
    } catch (error) {
      if (error instanceof AppwriteException && error.code === 401) {
        throw new Error('Invalid email or password');
      }
      throw error;
    }

    // Store session in HttpOnly cookie
    setCookie('appwrite-session', session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true };
  });

// React component
export default function LoginPage() {
  const router = useRouter();
  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: LoginSchema },
  });

  const login = useMutation({
    mutationFn: (data: z.infer<typeof LoginSchema>) => loginFn({ data }),
    onSuccess: () => router.navigate({ to: '/dashboard' }),
    onError: (err) => form.setError('root', err.message),
  });

  return (
    <form onSubmit={form.handleSubmit(data => login.mutate(data))}>
      <FormField form={form} name="email" label="Email" type="email" />
      <FormField form={form} name="password" label="Password" type="password" />
      {form.formState.errors.root && (
        <Alert variant="destructive">{form.formState.errors.root.message}</Alert>
      )}
      <Button type="submit" loading={login.isPending}>Sign In</Button>
    </form>
  );
}
```

---

## Flow 2: Logout — Server-Side Session Deletion

```typescript
export const logoutFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    const { account } = createSessionClient();

    try {
      await account.deleteSession('current');
    } catch (error) {
      // Session may already be expired — still clear the cookie
      if (!(error instanceof AppwriteException && error.code === 401)) {
        throw error;
      }
    }

    // Always clear the cookie, even if session was already gone
    deleteCookie('appwrite-session');
    return { success: true };
  });

// LogoutButton component
export const LogoutButton = () => {
  const router = useRouter();
  const logout = useMutation({
    mutationFn: () => logoutFn(),
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
      router.navigate({ to: '/login' });
    },
  });

  return (
    <Button
      variant="ghost"
      onClick={() => logout.mutate()}
      loading={logout.isPending}
    >
      Sign Out
    </Button>
  );
};
```

---

## Flow 3: OAuth Provider Authentication

```typescript
// Generate OAuth URL (redirect to provider)
export const getOAuthUrlFn = createServerFn({ method: 'GET' })
  .validator(z.object({
    provider: z.enum(['google', 'github', 'discord']),
    redirectTo: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const { account } = createAdminClient();
    const providerMap = {
      google:  OAuthProvider.Google,
      github:  OAuthProvider.Github,
      discord: OAuthProvider.Discord,
    };

    const successUrl = `${process.env.APP_URL}/auth/callback?redirect=${data.redirectTo ?? '/dashboard'}`;
    const failureUrl = `${process.env.APP_URL}/login?error=oauth_failed`;

    // Returns URL string — client must redirect to it
    return account.createOAuth2Token(providerMap[data.provider], successUrl, failureUrl);
  });

// OAuth callback handler — after provider redirects back
export const oauthCallbackFn = createServerFn({ method: 'GET' })
  .validator(z.object({
    userId: z.string(),
    secret: z.string(),
    redirect: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const { account } = createAdminClient();

    const session = await account.createSession(data.userId, data.secret);

    setCookie('appwrite-session', session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    // Validate redirect is safe (relative path only)
    const safeRedirect = data.redirect?.startsWith('/') ? data.redirect : '/dashboard';
    return { redirectTo: safeRedirect };
  });
```

---

## Flow 4: Session Validation Middleware

```typescript
// middleware/auth.ts — Applied to all protected routes

export const requireAuthMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const session = getCookie('appwrite-session');

    if (!session) {
      throw redirect({ to: '/login', search: { reason: 'no_session' } });
    }

    const { account } = createSessionClient();
    let user: Models.User<Models.Preferences>;
    try {
      user = await account.get();
    } catch (error) {
      if (error instanceof AppwriteException && error.code === 401) {
        deleteCookie('appwrite-session'); // Clear stale cookie
        throw redirect({ to: '/login', search: { reason: 'session_expired' } });
      }
      throw error;
    }

    return next({ context: { user } });
  });

// Login page reads the reason and shows appropriate message
export default function LoginPage() {
  const { reason } = Route.useSearch();
  const message = {
    no_session:      'Please sign in to continue.',
    session_expired: 'Your session has expired. Please sign in again.',
  }[reason ?? ''];

  return (
    <div>
      {message && <Alert>{message}</Alert>}
      {/* login form */}
    </div>
  );
}
```

---

## Flow 5: Multi-Device Session Management

```typescript
// List all active sessions
export const getSessionsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { account } = createSessionClient();
    await account.get(); // Auth check
    const sessions = await account.listSessions();
    return sessions.sessions.map(s => ({
      $id: s.$id,
      current: s.current,
      clientName: s.clientName,
      clientOs: s.clientOs,
      ip: s.ip,
      countryName: s.countryName,
      createdAt: s.$createdAt,
    }));
  });

// Revoke a specific session (remote logout)
export const revokeSessionFn = createServerFn({ method: 'POST' })
  .validator(z.object({ sessionId: z.string() }))
  .handler(async ({ data }) => {
    const { account } = createSessionClient();
    await account.get(); // Must be authenticated to revoke
    await account.deleteSession(data.sessionId);
  });

// Revoke ALL sessions (security lockout)
export const revokeAllSessionsFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    const { account } = createSessionClient();
    await account.get();
    await account.deleteSessions(); // Revokes all
    deleteCookie('appwrite-session');
  });
```

---

## Flow 6: Account Management

```typescript
// Update display name
export const updateNameFn = createServerFn({ method: 'POST' })
  .validator(z.object({ name: z.string().min(1).max(128) }))
  .handler(async ({ data }) => {
    const { account } = createSessionClient();
    await account.get();
    return account.updateName(data.name);
  });

// Update password (requires current password)
export const updatePasswordFn = createServerFn({ method: 'POST' })
  .validator(z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
  }))
  .handler(async ({ data }) => {
    const { account } = createSessionClient();
    await account.get();

    try {
      await account.updatePassword(data.newPassword, data.currentPassword);
    } catch (error) {
      if (error instanceof AppwriteException && error.code === 401) {
        throw new Error('Current password is incorrect');
      }
      throw error;
    }
  });

// Request password reset (unauthenticated)
export const requestPasswordResetFn = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const { account } = createAdminClient();
    try {
      await account.createRecovery(
        data.email,
        `${process.env.APP_URL}/reset-password`
      );
    } catch {
      // Never expose whether the email exists or not (security)
    }
    return { message: 'If that email exists, a reset link has been sent.' };
  });

// Complete password reset
export const completePasswordResetFn = createServerFn({ method: 'POST' })
  .validator(z.object({
    userId: z.string(),
    secret: z.string(),
    newPassword: z.string().min(8),
  }))
  .handler(async ({ data }) => {
    const { account } = createAdminClient();
    await account.updateRecovery(data.userId, data.secret, data.newPassword);
  });
```
