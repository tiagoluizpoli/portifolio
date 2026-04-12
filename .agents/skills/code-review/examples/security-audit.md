# Example: Security Audit

**Scenario**: Reviewing a new server function that handles user-generated public portfolio sharing.

---

## Files Under Review

- `apps/cms/routes/share/route.tsx`
- `packages/appwrite-core/share.functions.ts`
- `apps/cms/components/share/share-dialog.tsx`

---

## Security Scan Output

```bash
$ bash security-scanner.sh

=== SECURITY QUICK SCAN ===

[Potential Secrets]
  ✅ None found

[XSS Risk: dangerouslySetInnerHTML]
  🔴 share-dialog.tsx:67 — dangerouslySetInnerHTML with unsanitized user content

[Server Functions Missing Auth Check]
  ⚠️  share.functions.ts — No account.get() found

[Sensitive Logging]
  🟠 share.functions.ts:34 — console.log includes shareToken

=== END SECURITY SCAN ===
```

---

## Finding 1: XSS via dangerouslySetInnerHTML — 🔴 P0 CRITICAL

**Location**: `share-dialog.tsx:67`

```tsx
// ❌ CRITICAL CURRENT — User's bio is rendered directly as HTML
const SharePreview = ({ portfolio }: { portfolio: Portfolio }) => (
  <div dangerouslySetInnerHTML={{ __html: portfolio.bio }} />
  // portfolio.bio comes from user input, stored in Appwrite
  // Attacker stores: <script>document.cookie='...'</script> in their bio
  // This script executes on EVERY user who views the share preview
);

// ✅ REQUIRED FIX — Sanitize with DOMPurify before rendering
import DOMPurify from 'dompurify';

const SharePreview = ({ portfolio }: { portfolio: Portfolio }) => {
  const safeBio = DOMPurify.sanitize(portfolio.bio, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
  return <div dangerouslySetInnerHTML={{ __html: safeBio }} />;
};

// BETTER FIX — Don't use dangerouslySetInnerHTML at all
// Store bio as plain text, render with white-space: pre-wrap
const SharePreview = ({ portfolio }: { portfolio: Portfolio }) => (
  <p style={{ whiteSpace: 'pre-wrap' }}>{portfolio.bio}</p>
);
```

---

## Finding 2: Missing Server-Side Auth — 🔴 P0 CRITICAL

**Location**: `share.functions.ts`

```typescript
// ❌ CRITICAL CURRENT — Any anonymous user can create share links for anyone
export const createShareLinkFn = createServerFn()
  .validator(z.object({ portfolioId: z.string() }))
  .handler(async ({ data }) => {
    // No auth check! No ownership check!
    const shareToken = generateToken();
    await databases.createDocument(DB_ID, SHARES_ID, ID.unique(), {
      portfolioId: data.portfolioId,
      token: shareToken,
    });
    return { token: shareToken };
  });

// ✅ REQUIRED FIX — Auth + ownership at server boundary
export const createShareLinkFn = createServerFn()
  .validator(z.object({ portfolioId: z.string() as z.ZodType<PortfolioId> }))
  .handler(async ({ data }) => {
    // 1. Authenticate
    const { account, databases } = createSessionClient();
    const currentUser = await account.get(); // Throws 401 if not authenticated

    // 2. Verify ownership
    const portfolio = await databases.getDocument(DB_ID, PORTFOLIO_ID, data.portfolioId);
    if (portfolio.userId !== currentUser.$id) {
      throw new Error('Forbidden: you do not own this portfolio');
    }

    // 3. Proceed with operation
    const shareToken = generateToken();
    await databases.createDocument(
      DB_ID, SHARES_ID, ID.unique(),
      { portfolioId: data.portfolioId, token: shareToken, createdBy: currentUser.$id },
      [Permission.read(Role.any()), Permission.write(Role.user(currentUser.$id))]
    );
    return { token: shareToken };
  });
```

---

## Finding 3: Token in Logs — 🟠 P1 HIGH

**Location**: `share.functions.ts:34`

```typescript
// ❌ HIGH CURRENT — Share token logged to console (appears in server logs)
const shareToken = generateToken();
console.log('Created share token:', shareToken); // Token now in server logs

// ✅ FIX — Log only non-sensitive correlation data
console.log('Share link created:', {
  portfolioId: data.portfolioId,
  userId: currentUser.$id,
  timestamp: new Date().toISOString(),
  // Token deliberately NOT logged
});
```

---

## Finding 4: Open Redirect on Share Completion — 🟠 P1 HIGH

**Location**: `share-dialog.tsx:134`

```typescript
// ❌ HIGH CURRENT — Redirect URL from user-controlled state
const handleShareComplete = () => {
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  window.location.href = redirect; // Attacker: ?redirect=https://evil.com
};

// ✅ FIX — Validate redirect is a relative path on our domain
const handleShareComplete = () => {
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  const safeRedirect = 
    redirect && redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : '/dashboard';
  window.location.href = safeRedirect;
};
```

---

## Security Review Report

```markdown
# Security Audit — Portfolio Share Feature
Date: 2026-04-12

## Summary
HARD STOP. Two P0 critical vulnerabilities found. This feature MUST NOT be merged 
or deployed until both are fixed and verified.

## Findings

### 🔴 P0 CRITICAL — XSS via unsanitized user content
  File: share-dialog.tsx:67
  Vector: Stored XSS via portfolio.bio → dangerouslySetInnerHTML
  Impact: Script execution for any viewer of a shared portfolio
  Fix: Remove dangerouslySetInnerHTML OR sanitize with DOMPurify (allowedTags whitelist)
  
### 🔴 P0 CRITICAL — No server-side auth on createShareLinkFn  
  File: share.functions.ts
  Vector: Unauthenticated privilege escalation — create share links for any portfolio
  Impact: Attacker can expose any user's portfolio without permission
  Fix: Add account.get() + ownership check as first operation

### 🟠 P1 HIGH — Share token logged to server console
  File: share.functions.ts:34
  Vector: Token exposure via server logs (log aggregation system)
  Impact: Leaked tokens allow unauthorized portfolio access indefinitely
  Fix: Remove token from console.log

### 🟠 P1 HIGH — Open redirect on share completion
  File: share-dialog.tsx:134
  Vector: ?redirect parameter accepted without validation
  Impact: Phishing attacks via legitimate portfolio share URLs
  Fix: Validate redirect is relative path only

## Action Required
- [ ] Fix both P0 issues before any testing or demo
- [ ] Re-run security scanner after fixes
- [ ] Add security test cases to share.functions test suite
```
