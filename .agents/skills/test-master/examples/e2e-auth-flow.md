# E2E Auth Flow — Complete Playwright Example

**Scenario**: Full authentication journey — login, session persistence, protected route access, logout, and password reset.

---

## File Structure

```
tests/e2e/
├── pages/
│   ├── login.page.ts
│   └── dashboard.page.ts
├── fixtures/
│   └── auth.fixture.ts
├── helpers/
│   └── auth.helpers.ts
├── auth.spec.ts
└── .auth/
    └── user.json   ← Saved auth state (gitignored)
```

---

## Page Objects

```typescript
// tests/e2e/pages/login.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly googleOAuthButton: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(readonly page: Page) {
    this.emailInput      = page.getByLabel(/email/i);
    this.passwordInput   = page.getByLabel(/password/i);
    this.submitButton    = page.getByRole('button', { name: /sign in/i });
    this.errorAlert      = page.getByRole('alert');
    this.googleOAuthButton = page.getByRole('button', { name: /google/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot/i });
  }

  async goto() {
    await this.page.goto('/login');
    await expect(this.submitButton).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(pattern: RegExp) {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(pattern);
  }
}

// tests/e2e/pages/dashboard.page.ts
export class DashboardPage {
  constructor(readonly page: Page) {}

  get heading()        { return this.page.getByRole('heading', { level: 1 }); }
  get logoutButton()   { return this.page.getByRole('button', { name: /sign out/i }); }
  get userMenuButton() { return this.page.getByRole('button', { name: /account/i }); }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL('/login');
  }
}
```

---

## Global Setup — Save Auth State

```typescript
// tests/e2e/global.setup.ts
import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

async function globalSetup() {
  const authStateDir = path.join(__dirname, '.auth');
  fs.mkdirSync(authStateDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(process.env.E2E_USER_EMAIL!, process.env.E2E_USER_PASSWORD!);
  await page.waitForURL('/dashboard');

  // Save session state — reused by all authenticated tests
  await page.context().storageState({
    path: path.join(authStateDir, 'user.json'),
  });

  await browser.close();
}

export default globalSetup;
```

---

## Auth Fixture

```typescript
// tests/e2e/fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type Fixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
});

export { expect } from '@playwright/test';
```

---

## Auth Spec — Complete Scenario Coverage

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from './fixtures/auth.fixture';
import { LoginPage } from './pages/login.page';
import { DashboardPage } from './pages/dashboard.page';

// ─────────────────────────────────────────────
// CLASS 1: HAPPY PATH
// ─────────────────────────────────────────────
test.describe('Login — Happy Path', () => {
  test('logs in with valid credentials and redirects to dashboard', async ({ loginPage, page }) => {
    await loginPage.login(
      process.env.E2E_USER_EMAIL!,
      process.env.E2E_USER_PASSWORD!
    );
    await expect(page).toHaveURL('/dashboard');
    const dashboard = new DashboardPage(page);
    await expect(dashboard.heading).toBeVisible();
  });

  test('session persists after page reload', async ({ loginPage, page }) => {
    await loginPage.login(process.env.E2E_USER_EMAIL!, process.env.E2E_USER_PASSWORD!);
    await page.waitForURL('/dashboard');
    await page.reload();
    // Should still be on dashboard, not redirected to login
    await expect(page).toHaveURL('/dashboard');
  });
});

// ─────────────────────────────────────────────
// CLASS 2: INVALID CREDENTIALS
// ─────────────────────────────────────────────
test.describe('Login — Invalid Credentials', () => {
  test('shows error for wrong password', async ({ loginPage }) => {
    await loginPage.login(process.env.E2E_USER_EMAIL!, 'WrongPassword123');
    await loginPage.expectError(/invalid email or password/i);
    await expect(loginPage.page).toHaveURL('/login'); // Stays on login
  });

  test('shows error for non-existent email', async ({ loginPage }) => {
    await loginPage.login('nonexistent@test.com', 'AnyPassword123');
    await loginPage.expectError(/invalid email or password/i);
  });

  test('shows validation error for malformed email', async ({ loginPage }) => {
    await loginPage.emailInput.fill('not-an-email');
    await loginPage.passwordInput.fill('password123');
    await loginPage.submitButton.click();
    // Should show HTML5 validation or custom validation error, NOT call the server
    await expect(loginPage.page).toHaveURL('/login');
  });

  test('shows validation error when password is empty', async ({ loginPage }) => {
    await loginPage.emailInput.fill('test@example.com');
    await loginPage.submitButton.click();
    await expect(loginPage.page).toHaveURL('/login');
  });

  test('rate limiting: shows rate limit message after many failed attempts', async ({ loginPage }) => {
    // Simulate multiple failed logins
    for (let i = 0; i < 5; i++) {
      await loginPage.login('test@example.com', 'WrongPassword');
      await loginPage.emailInput.clear(); // Clear for next attempt
    }
    await loginPage.expectError(/too many attempts/i);
  });
});

// ─────────────────────────────────────────────
// CLASS 3: PROTECTED ROUTE ACCESS
// ─────────────────────────────────────────────
test.describe('Protected Routes', () => {
  test('redirects unauthenticated visitors to login', async ({ page }) => {
    // New browser context — no saved auth
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/reason=unauthorized/);
  });

  test('shows appropriate message for redirected unauthorized visitor', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/please sign in to continue/i)).toBeVisible();
  });

  test('redirects to original destination after login', async ({ page }) => {
    await page.goto('/dashboard/settings'); // Specific protected URL
    await expect(page).toHaveURL(/\/login/);

    const loginPage = new LoginPage(page);
    await loginPage.login(process.env.E2E_USER_EMAIL!, process.env.E2E_USER_PASSWORD!);

    // Should end up at the originally requested URL
    await expect(page).toHaveURL('/dashboard/settings');
  });
});

// ─────────────────────────────────────────────
// CLASS 4: LOGOUT FLOW
// ─────────────────────────────────────────────
test.describe('Logout', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' }); // Pre-authenticated

  test('logs out and redirects to login page', async ({ page }) => {
    await page.goto('/dashboard');
    const dashboard = new DashboardPage(page);
    await dashboard.logout();
    await expect(page).toHaveURL('/login');
  });

  test('cannot access protected routes after logout', async ({ page }) => {
    await page.goto('/dashboard');
    const dashboard = new DashboardPage(page);
    await dashboard.logout();

    await page.goto('/dashboard'); // Try to access again
    await expect(page).toHaveURL(/\/login/);
  });

  test('back button after logout does not restore session', async ({ page }) => {
    await page.goto('/dashboard');
    const dashboard = new DashboardPage(page);
    await dashboard.logout();

    await page.goBack();
    // Browser back should not show dashboard data — should redirect to login
    await expect(page).toHaveURL(/\/login|\/dashboard/);
    if (page.url().includes('/dashboard')) {
      // If browser navigated back, verify page refetches and redirects
      await expect(page).toHaveURL(/\/login/, { timeout: 3000 });
    }
  });
});

// ─────────────────────────────────────────────
// CLASS 5: SESSION EXPIRY
// ─────────────────────────────────────────────
test.describe('Session Expiry', () => {
  test('shows session expired message when navigating with expired token', async ({ page }) => {
    // Set an invalid session cookie to simulate expiry
    await page.context().addCookies([{
      name: 'session',
      value: 'expired-invalid-token',
      domain: new URL(process.env.APP_URL!).hostname,
      path: '/',
      httpOnly: true,
    }]);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/reason=session_expired/);
    await expect(page.getByText(/session.*(expired|ended)/i)).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// CLASS 6: NETWORK FAILURES
// ─────────────────────────────────────────────
test.describe('Network Failures', () => {
  test('shows error when login server is unavailable', async ({ loginPage, page }) => {
    await page.route('**/v1/account/sessions/email', route =>
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Server error' }) })
    );
    await loginPage.login(process.env.E2E_USER_EMAIL!, process.env.E2E_USER_PASSWORD!);
    await loginPage.expectError(/failed|try again/i);
    expect(page.url()).toContain('/login');
  });

  test('handles network timeout gracefully', async ({ loginPage, page }) => {
    await page.route('**/v1/account/**', route =>
      new Promise(() => { /* Never resolve — simulate timeout */ })
    );
    await loginPage.emailInput.fill(process.env.E2E_USER_EMAIL!);
    await loginPage.passwordInput.fill(process.env.E2E_USER_PASSWORD!);
    await loginPage.submitButton.click();

    // Loading state should be visible
    await expect(loginPage.submitButton).toBeDisabled();
    // After request timeout, error should appear
    await loginPage.expectError(/try again/i);
  });
});
```
