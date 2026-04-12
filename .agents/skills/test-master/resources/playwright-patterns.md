# Playwright Patterns — E2E Test Reference

---

## Page Object Model (POM)

Never write raw Playwright selectors scattered across test files. Encapsulate them in Page Objects.

```typescript
// tests/e2e/pages/items.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class ItemsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addButton: Locator;
  readonly itemsList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /items/i });
    this.addButton = page.getByRole('button', { name: /add item/i });
    this.itemsList = page.getByRole('list', { name: /items list/i });
  }

  async goto() {
    await this.page.goto('/admin/items');
    await expect(this.heading).toBeVisible();
  }

  async openAddDialog() {
    await this.addButton.click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
    return new AddItemDialog(this.page);
  }

  itemCard(name: string) {
    return this.page.getByRole('article', { name: new RegExp(name, 'i') });
  }

  async waitForItem(name: string) {
    await expect(this.itemCard(name)).toBeVisible({ timeout: 5000 });
  }
}

export class AddItemDialog {
  constructor(private page: Page) {}

  get titleInput() { return this.page.getByLabel(/title/i); }
  get statusSelect() { return this.page.getByRole('combobox', { name: /status/i }); }
  get saveButton() { return this.page.getByRole('button', { name: /save/i }); }

  async fillAndSave(item: { title: string; status?: string }) {
    await this.titleInput.fill(item.title);
    if (item.status) {
      await this.statusSelect.selectOption(item.status);
    }
    await this.saveButton.click();
  }
}
```

```typescript
// tests/e2e/items.spec.ts — Using the POM
import { test, expect } from '@playwright/test';
import { ItemsPage } from './pages/items.page';

test('user can add an item', async ({ page }) => {
  const itemsPage = new ItemsPage(page);
  await itemsPage.goto();
  const dialog = await itemsPage.openAddDialog();
  await dialog.fillAndSave({ title: 'My First Post', status: 'draft' });
  await itemsPage.waitForItem('My First Post');
});
```

---

## Authentication Fixtures

```typescript
// tests/e2e/fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';
import { login, loginAsAdmin } from '../helpers/auth';

type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await login(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await use(page);
    // Cleanup: no need to logout — browser context is reset after each test
  },

  adminPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
  },
});

// helpers/auth.ts
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/dashboard');
}
```

---

## Network Interception (Failure Simulation)

```typescript
test('shows error when Appwrite is unavailable', async ({ page }) => {
  // Intercept all Appwrite API calls and return 500
  await page.route('**/v1/databases/**', async route => {
    await route.fulfill({ status: 500, body: JSON.stringify({ message: 'Server error' }) });
  });

  await page.goto('/admin/items');
  await expect(page.getByText(/something went wrong/i)).toBeVisible();
});

test('shows offline indicator when network is unavailable', async ({ context, page }) => {
  await context.setOffline(true);
  await page.goto('/admin/items');
  await expect(page.getByText(/no internet connection/i)).toBeVisible();
  await context.setOffline(false); // Restore
});
```

---

## Saved Auth State (Speed Optimization)

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: /global.setup\.ts/, // Runs once before all tests
    },
    {
      name: 'authenticated',
      use: {
        storageState: 'tests/e2e/.auth/user.json', // Reuse saved session
      },
      dependencies: ['setup'],
    },
  ],
});

// tests/e2e/global.setup.ts
import { chromium } from '@playwright/test';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(process.env.TEST_URL!);
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');

  // Save auth state to file
  await page.context().storageState({ path: 'tests/e2e/.auth/user.json' });
  await browser.close();
}

export default globalSetup;
```

---

## Cross-Browser Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    { name: 'mobile',   use: { ...devices['iPhone 13'] } }, // Mobile viewport
  ],
  // Run headless in CI, headed locally
  use: { headless: !!process.env.CI },
});
```

---

## Resilience Patterns

```typescript
// Auto-retrying assertions (built-in to Playwright)
// All expect() calls retry automatically until timeout
await expect(page.getByText('Item saved')).toBeVisible({ timeout: 5000 });

// Avoid: page.waitForTimeout(1000) — flaky, not deterministic
// Use: await expect(el).toBeVisible() — retries until visible

// Wait for network idle after mutations
await page.getByRole('button', { name: /save/i }).click();
await page.waitForResponse(res => res.url().includes('/databases') && res.status() === 201);
// Then assert on UI
await expect(page.getByText('My First Post')).toBeVisible();
```
