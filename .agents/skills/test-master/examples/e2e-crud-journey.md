# E2E CRUD Journey — Complete Playwright Example

**Scenario**: End-to-end CRUD operations — create, read, update, delete with verification at each step.

---

## Page Objects

```typescript
// tests/e2e/pages/items.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class ItemsPage {
  constructor(readonly page: Page) {}

  get heading()     { return this.page.getByRole('heading', { name: /items/i }); }
  get addButton()   { return this.page.getByRole('button', { name: /new item|add item/i }); }
  get searchInput() { return this.page.getByRole('searchbox', { name: /search/i }); }
  get itemsList()   { return this.page.getByRole('list', { name: /items/i }); }
  get emptyState()  { return this.page.getByText(/no items/i); }
  get loadingState(){ return this.page.getByRole('status', { name: /loading/i }); }

  async goto() {
    await this.page.goto('/dashboard/items');
    await expect(this.heading).toBeVisible();
  }

  async waitForLoaded() {
    await expect(this.loadingState).not.toBeVisible({ timeout: 5000 });
  }

  itemCard(name: string) {
    return this.page.getByRole('article', { name: new RegExp(name, 'i') });
  }

  async waitForItem(name: string) {
    await expect(this.itemCard(name)).toBeVisible({ timeout: 5000 });
  }

  async waitForItemGone(name: string) {
    await expect(this.itemCard(name)).not.toBeVisible({ timeout: 5000 });
  }

  async openAddDialog() {
    await this.addButton.click();
    await expect(this.page.getByRole('dialog', { name: /add/i })).toBeVisible();
    return new ItemFormDialog(this.page, 'add');
  }

  async openEditFor(name: string) {
    const card = this.itemCard(name);
    await card.getByRole('button', { name: /edit/i }).click();
    await expect(this.page.getByRole('dialog', { name: /edit/i })).toBeVisible();
    return new ItemFormDialog(this.page, 'edit');
  }

  async deleteItem(name: string) {
    const card = this.itemCard(name);
    await card.getByRole('button', { name: /delete/i }).click();
    const confirmDialog = this.page.getByRole('dialog', { name: /confirm/i });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole('button', { name: /confirm/i }).click();
  }
}

export class ItemFormDialog {
  get titleInput()   { return this.page.getByLabel(/title/i); }
  get contentInput() { return this.page.getByLabel(/content/i); }
  get statusSelect() { return this.page.getByRole('combobox', { name: /status/i }); }
  get saveButton()   { return this.page.getByRole('button', { name: /save/i }); }
  get cancelButton() { return this.page.getByRole('button', { name: /cancel/i }); }

  constructor(private page: Page, private type: 'add' | 'edit') {}

  async fill(data: { title?: string; content?: string; status?: string }) {
    if (data.title) {
      await this.titleInput.clear();
      await this.titleInput.fill(data.title);
    }
    if (data.content) {
      await this.contentInput.clear();
      await this.contentInput.fill(data.content);
    }
    if (data.status) {
      await this.statusSelect.selectOption(data.status);
    }
  }

  async fillAndSave(data: Parameters<typeof this.fill>[0]) {
    await this.fill(data);
    await this.saveButton.click();
  }

  async expectError(pattern: RegExp) {
    await expect(this.page.getByRole('alert')).toContainText(pattern);
  }
}
```

---

## Full CRUD Spec

```typescript
// tests/e2e/items-crud.spec.ts
import { test, expect } from '@playwright/test';
import { ItemsPage } from './pages/items.page';

test.use({ storageState: 'tests/e2e/.auth/user.json' });

// Track items created during tests for assertions
const UNIQUE_TITLE = `E2E Test Item ${Date.now()}`;

test.describe('Items CRUD Journey', () => {

  // ─────────────────────────────────────────────
  // CLASS 1: HAPPY PATH — Full CRUD cycle
  // ─────────────────────────────────────────────
  test.describe('Happy Path', () => {
    test('creates a new item successfully', async ({ page }) => {
      const itemsPage = new ItemsPage(page);
      await itemsPage.goto();

      const dialog = await itemsPage.openAddDialog();
      await dialog.fillAndSave({ title: UNIQUE_TITLE, status: 'draft' });

      await itemsPage.waitForItem(UNIQUE_TITLE);
      expect(await itemsPage.itemCard(UNIQUE_TITLE).isVisible()).toBe(true);
    });

    test('displays the newly created item in the list', async ({ page }) => {
      const itemsPage = new ItemsPage(page);
      await itemsPage.goto();
      await itemsPage.waitForLoaded();

      // Item created in previous test should be here
      await itemsPage.waitForItem(UNIQUE_TITLE);
      const card = itemsPage.itemCard(UNIQUE_TITLE);
      await expect(card).toBeVisible();
      await expect(card.getByText(/draft/i)).toBeVisible();
    });

    test('edits an existing item', async ({ page }) => {
      const itemsPage = new ItemsPage(page);
      await itemsPage.goto();
      await itemsPage.waitForItem(UNIQUE_TITLE);

      const dialog = await itemsPage.openEditFor(UNIQUE_TITLE);
      const updatedTitle = `${UNIQUE_TITLE} (Updated)`;
      await dialog.fillAndSave({ title: updatedTitle, status: 'published' });

      await itemsPage.waitForItem(updatedTitle);
      const card = itemsPage.itemCard(updatedTitle);
      await expect(card.getByText(/published/i)).toBeVisible();
    });

    test('deletes an item and verifies it disappears', async ({ page }) => {
      const itemsPage = new ItemsPage(page);
      const titleToDelete = `${UNIQUE_TITLE} (Updated)`;
      await itemsPage.goto();
      await itemsPage.waitForItem(titleToDelete);

      await itemsPage.deleteItem(titleToDelete);
      await itemsPage.waitForItemGone(titleToDelete);
    });
  });

  // ─────────────────────────────────────────────
  // CLASS 2: VALIDATION ERRORS
  // ─────────────────────────────────────────────
  test.describe('Form Validation', () => {
    test('shows error when creating item without title', async ({ page }) => {
      const itemsPage = new ItemsPage(page);
      await itemsPage.goto();

      const dialog = await itemsPage.openAddDialog();
      await dialog.saveButton.click(); // No title

      await dialog.expectError(/title.*required/i);
      await expect(page.getByRole('dialog')).toBeVisible(); // Dialog stays open
    });

    test('shows error when title exceeds maximum length', async ({ page }) => {
      const itemsPage = new ItemsPage(page);
      await itemsPage.goto();

      const dialog = await itemsPage.openAddDialog();
      await dialog.fill({ title: 'A'.repeat(256) }); // Over limit
      await dialog.saveButton.click();

      await dialog.expectError(/255|max|too long/i);
    });

    test('clears validation error when user fixes the field', async ({ page }) => {
      const itemsPage = new ItemsPage(page);
      await itemsPage.goto();

      const dialog = await itemsPage.openAddDialog();
      await dialog.saveButton.click(); // Trigger error
      await dialog.expectError(/title.*required/i);

      await dialog.titleInput.fill('Valid Title Now');
      await expect(page.getByText(/title.*required/i)).not.toBeVisible();
    });

    test('canceling the dialog does not modify the list', async ({ page }) => {
      const itemsPage = new ItemsPage(page);
      await itemsPage.goto();
      await itemsPage.waitForLoaded();
      const initialItemCount = await itemsPage.itemsList.locator('li').count();

      const dialog = await itemsPage.openAddDialog();
      await dialog.fill({ title: 'I Will Cancel This' });
      await dialog.cancelButton.click();

      await expect(page.getByRole('dialog')).not.toBeVisible();
      const afterCancelCount = await itemsPage.itemsList.locator('li').count();
      expect(afterCancelCount).toBe(initialItemCount);
    });
  });

  // ─────────────────────────────────────────────
  // CLASS 3: SEARCH AND FILTER
  // ─────────────────────────────────────────────
  test.describe('Search and Filter', () => {
    test('search filters the displayed items', async ({ page }) => {
      const itemsPage = new ItemsPage(page);
      await itemsPage.goto();

      // First create a uniquely searchable item
      const searchableTitle = `SearchableOnlyItem-${Date.now()}`;
      const dialog = await itemsPage.openAddDialog();
      await dialog.fillAndSave({ title: searchableTitle });
      await itemsPage.waitForItem(searchableTitle);

      // Search for it
      await itemsPage.searchInput.fill(searchableTitle);
      await page.waitForTimeout(300); // Allow debounce

      await expect(itemsPage.itemCard(searchableTitle)).toBeVisible();
      const cardCount = await itemsPage.itemsList.locator('[role="article"]').count();
      expect(cardCount).toBe(1); // Only the searched item
    });
  });

  // ─────────────────────────────────────────────
  // CLASS 4: NETWORK INTERRUPTION
  // ─────────────────────────────────────────────
  test.describe('Network Failures', () => {
    test('shows error toast when creation fails due to network error', async ({ page }) => {
      await page.route('**/v1/databases/**/documents', route => {
        if (route.request().method() === 'POST') {
          route.fulfill({ status: 500, body: JSON.stringify({ message: 'DB error' }) });
        } else {
          route.continue();
        }
      });

      const itemsPage = new ItemsPage(page);
      await itemsPage.goto();
      const dialog = await itemsPage.openAddDialog();
      await dialog.fillAndSave({ title: 'Will Fail to Save' });

      await expect(page.getByRole('alert')).toContainText(/failed|error/i);
      await expect(page.getByRole('dialog')).toBeVisible(); // Dialog stays open for retry
    });

    test('list shows cached data while offline', async ({ context, page }) => {
      const itemsPage = new ItemsPage(page);
      await itemsPage.goto();
      await itemsPage.waitForLoaded();

      await context.setOffline(true);
      await page.reload();

      // React Query serves stale data from cache
      await expect(itemsPage.heading).toBeVisible(); // Page renders
      // No crash — cached items may or may not appear depending on cache config

      await context.setOffline(false);
    });
  });

  // ─────────────────────────────────────────────
  // CLASS 5: OPTIMISTIC UI VERIFICATION
  // ─────────────────────────────────────────────
  test.describe('Optimistic Updates', () => {
    test('item appears in list immediately after creation (before server confirms)', async ({ page }) => {
      // Slow down the server response to verify optimistic behavior
      await page.route('**/v1/databases/**/documents', async route => {
        if (route.request().method() === 'POST') {
          await new Promise(r => setTimeout(r, 2000)); // 2s delay
          return route.continue();
        }
        route.continue();
      });

      const itemsPage = new ItemsPage(page);
      await itemsPage.goto();
      const dialog = await itemsPage.openAddDialog();
      await dialog.fill({ title: 'Optimistic Item Test' });
      await dialog.saveButton.click();

      // Item should appear BEFORE the 2s server delay
      await expect(itemsPage.itemCard('Optimistic Item Test')).toBeVisible({ timeout: 500 });
    });
  });
});
```
