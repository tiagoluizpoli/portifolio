# Security Review — Threat Patterns & Severity Classifications

---

## Severity Levels

| Level | Color | Meaning | Action |
|:---|:---|:---|:---|
| P0 | 🔴 CRITICAL | Active vulnerability, data exposure, or auth bypass | Block merge immediately |
| P1 | 🟠 HIGH | Exploitable under specific conditions | Fix this sprint |
| P2 | 🟡 MEDIUM | Difficult to exploit, limited impact | Fix next sprint |
| P3 | 🟢 LOW | Defense-in-depth improvement | Backlog |

---

## Category 1: Authentication & Authorization

### 1.1 Missing Server-Side Auth Check — P0
```typescript
// ❌ CRITICAL: Checking auth only on the client
// Client-side guard — easily bypassed
if (!user) return <Navigate to="/login" />;

// Server function with NO auth check
export const getServerDataFn = createServerFn().handler(async () => {
  return databases.listDocuments(DB_ID, COLLECTION_ID); // Anyone can call this
});

// ✅ CORRECT: Auth check at the server function boundary
export const getServerDataFn = createServerFn().handler(async () => {
  const { account } = createSessionClient();
  const user = await account.get(); // Throws if not authenticated
  return databases.listDocuments(DB_ID, COLLECTION_ID);
});
```

### 1.2 Insufficient Authorization (Privilege Escalation) — P0
```typescript
// ❌ CRITICAL: Checking that user is logged in, but not that they OWN the resource
export const deleteSkillFn = createServerFn()
  .validator(z.object({ skillId: z.string() }))
  .handler(async ({ data }) => {
    const { account } = createSessionClient();
    await account.get(); // Verifies login...
    await databases.deleteDocument(DB_ID, SKILLS_ID, data.skillId); // ...but anyone can delete anyone's skill!
  });

// ✅ CORRECT: Verify ownership server-side
export const deleteSkillFn = createServerFn()
  .validator(z.object({ skillId: z.string() }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();
    const skill = await databases.getDocument(DB_ID, SKILLS_ID, data.skillId);
    if (skill.userId !== user.$id) throw new Error('Forbidden');
    await databases.deleteDocument(DB_ID, SKILLS_ID, data.skillId);
  });
```

### 1.3 Session Fixation / Improper Logout — P1
```typescript
// ❌ HIGH: Logout that doesn't invalidate server session
const handleLogout = () => {
  localStorage.removeItem('user'); // Client-only "logout" — server session still valid
  navigate('/login');
};

// ✅ CORRECT: Server-side session deletion
const handleLogout = async () => {
  await account.deleteSession('current'); // Invalidates server session
  navigate('/login');
};
```

---

## Category 2: Input Validation & Injection

### 2.1 No Input Validation Before Mutation — P0
```typescript
// ❌ CRITICAL: Raw user input directly to Appwrite
export const createSkillFn = createServerFn()
  .handler(async ({ data }) => {
    await databases.createDocument(DB_ID, SKILLS_ID, ID.unique(), data); // data is unvalidated
  });

// ✅ CORRECT: Zod validation as the first line of defense
const CreateSkillSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z]/, 'Must start with a letter'),
  level: z.number().min(1).max(10),
  category: z.enum(['frontend', 'backend', 'fullstack']),
});

export const createSkillFn = createServerFn()
  .validator(CreateSkillSchema)
  .handler(async ({ data }) => {
    // data is guaranteed valid here
    await databases.createDocument(DB_ID, SKILLS_ID, ID.unique(), data, [...permissions]);
  });
```

### 2.2 Cross-Site Scripting (XSS) — P0/P1
```tsx
// ❌ CRITICAL: Raw HTML from user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ❌ HIGH: Template literals in href
<a href={`javascript:${userValue}`}>  {/* XSS vector */}

// ✅ CORRECT: Only use dangerouslySetInnerHTML with sanitized content
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ✅ CORRECT: Validate hrefs are safe protocols
const isSafeUrl = (url: string) => /^(https?|mailto):\/\//.test(url);
<a href={isSafeUrl(url) ? url : '#'}>{text}</a>
```

### 2.3 Open Redirect — P1
```typescript
// ❌ HIGH: Redirect to any URL from query param
const { redirect } = useRouterState().searchParams;
navigate(redirect); // Attacker can redirect to malicious site

// ✅ CORRECT: Validate redirect is a relative path
const safeRedirect = redirect?.startsWith('/') ? redirect : '/dashboard';
navigate(safeRedirect);
```

---

## Category 3: Data Exposure

### 3.1 Sensitive Data in Logs — P1
```typescript
// ❌ HIGH: Logging sensitive data
console.log('User login attempt:', { email, password }); // Password in logs!
console.log('Token:', authToken);

// ✅ CORRECT: Log only non-sensitive identifiers
console.log('User login attempt:', { email, timestamp: new Date() });
```

### 3.2 Hardcoded Secrets — P0
```typescript
// ❌ CRITICAL: Hardcoded credentials in source code
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const DB_URL = 'mongodb+srv://admin:password123@cluster.mongodb.net/';

// ✅ CORRECT: Environment variables only
const API_KEY = process.env.APPWRITE_API_KEY;
if (!API_KEY) throw new Error('Missing APPWRITE_API_KEY');
```

**Detection scanner:**
```bash
# Scan for potential secrets
grep -rn \
  -e "password\s*=\s*['\"]" \
  -e "secret\s*=\s*['\"]" \
  -e "api_key\s*=\s*['\"]" \
  -e "eyJ[a-zA-Z0-9_-]" \
  -e "sk-[a-zA-Z0-9]" \
  . --include="*.ts" --include="*.tsx" | \
  grep -v ".env" | grep -v "node_modules"
```

### 3.3 Stack Traces Exposed to Client — P1
```typescript
// ❌ HIGH: Sending raw error details to client
catch (error) {
  return Response.json({ error: error.message, stack: error.stack }); // Stack trace exposed
}

// ✅ CORRECT: Generic error + server-side logging
catch (error) {
  console.error('[ServerError]', error); // Log server-side
  return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
}
```

---

## Category 4: Appwrite-Specific Security

### 4.1 Missing Document-Level Permissions — P0
```typescript
// ❌ CRITICAL: Creating documents without explicit permissions
await databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), data);
// Inherits collection defaults — may be overly permissive

// ✅ CORRECT: Always specify document-level permissions
await databases.createDocument(
  DB_ID,
  COLLECTION_ID,
  ID.unique(),
  data,
  [
    Permission.read(Role.any()),         // Public read
    Permission.write(Role.user(userId)), // Only owner can write
  ]
);
```

### 4.2 Client-Side Permission via Server — P0
```typescript
// ❌ CRITICAL: Performing privileged operations using client SDK directly
// (client SDK permissions are determined by session, which is fine for user operations,
//  but server functions must use server SDK for admin operations)

// Creating the client properly:
// - For user operations: createSessionClient() — respects user permissions
// - For admin operations: createAdminClient() — uses server API key
// NEVER expose the admin client to the browser
```

### 4.3 Collection-Level Permissions Too Permissive — P1
```typescript
// ❌ HIGH: Collection that allows write to any authenticated user
// Collection permissions: write: users (any authenticated user can write)
// This means any logged-in user can modify any document

// ✅ CORRECT: Collection permissions = read-only broad access
// Document permissions = write access restricted to document owner
```

---

## Category 5: Cross-Cutting Security Patterns

### 5.1 CSRF Protection
- For state-mutating operations in traditional web apps: verify Origin/Referer headers
- TanStack Start server functions: called from the same origin → CSRF protected by default
- External webhooks: validate signatures (e.g., Appwrite webhook signatures)

### 5.2 Rate Limiting
- Authentication endpoints should be rate-limited
- File upload endpoints should be rate-limited
- API calls that trigger expensive operations should be rate-limited

### 5.3 Content Security Policy
- Verify `Content-Security-Policy` headers are configured
- No `unsafe-inline` in script-src unless explicitly justified
- No `unsafe-eval` unless absolutely required

---

## Security Scanner (Quick Check)

```bash
echo "=== SECURITY QUICK SCAN ==="

# Hardcoded secrets
echo "\n[Potential Secrets]"
grep -rn "password\s*=\s*['\"]" . --include="*.ts" --include="*.tsx" | \
  grep -v node_modules | grep -v ".env"

# dangerouslySetInnerHTML usage
echo "\n[XSS Risk: dangerouslySetInnerHTML]"
grep -rn "dangerouslySetInnerHTML" . --include="*.tsx" | grep -v node_modules

# Missing server-side auth in server functions
echo "\n[Server Functions Missing Auth Check]"
grep -rn "createServerFn" . --include="*.ts" --include="*.tsx" | \
  grep -v node_modules | while read line; do
    file=$(echo $line | cut -d: -f1)
    # Check if account.get() appears in the same file
    if ! grep -q "account\.get()" "$file" 2>/dev/null; then
      echo "  ⚠️  Possible missing auth: $file"
    fi
  done

# console.log with sensitive params
echo "\n[Sensitive Logging]"
grep -rn "console\.log.*password\|console\.log.*token\|console\.log.*secret" . \
  --include="*.ts" --include="*.tsx" | grep -v node_modules

echo "\n=== END SECURITY SCAN ==="
```
