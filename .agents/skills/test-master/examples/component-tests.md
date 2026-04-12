# Component Tests — Complete RTL Example

**All relevant scenario classes applied to a React component test suite.**

```typescript
// src/components/__tests__/ItemCard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockItem, createMockUser } from '../../test-utils/render';
import { ItemCard } from '../ItemCard';

// ─────────────────────────────────────────────
// TEST DATA
// ─────────────────────────────────────────────
const OWNER    = createMockUser({ $id: 'user-owner' });
const VISITOR  = createMockUser({ $id: 'user-visitor' });
const mockItem = createMockItem({ ownerId: OWNER.$id, title: 'TypeScript Mastery', status: 'published' });

// ─────────────────────────────────────────────
// ItemCard
// ─────────────────────────────────────────────
describe('ItemCard', () => {

  // ═══════════════════════════════════════════
  // CLASS 1: HAPPY PATH — renders correctly
  // ═══════════════════════════════════════════
  describe('Rendering', () => {
    it('displays the item title', () => {
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} />);
      expect(screen.getByText('TypeScript Mastery')).toBeVisible();
    });

    it('displays the item status badge', () => {
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} />);
      expect(screen.getByText(/published/i)).toBeVisible();
    });

    it('renders as an article element (semantic HTML)', () => {
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('includes an accessible label on the article with the item title', () => {
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} />);
      const article = screen.getByRole('article');
      expect(article).toHaveAccessibleName(/TypeScript Mastery/i);
    });
  });

  // ═══════════════════════════════════════════
  // CLASS 2: PERMISSION STATES (owner vs visitor)
  // ═══════════════════════════════════════════
  describe('Owner vs Visitor', () => {
    it('shows edit and delete buttons when viewer is the owner', () => {
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} />);
      expect(screen.getByRole('button', { name: /edit/i })).toBeVisible();
      expect(screen.getByRole('button', { name: /delete/i })).toBeVisible();
    });

    it('hides edit and delete buttons when viewer is not the owner', () => {
      render(<ItemCard item={mockItem} currentUserId={VISITOR.$id} />);
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    it('hides action buttons when viewer is not authenticated (null ID)', () => {
      render(<ItemCard item={mockItem} currentUserId={null} />);
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════
  // CLASS 3: INTERACTIONS
  // ═══════════════════════════════════════════
  describe('Interactions', () => {
    it('calls onEdit with the item when edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} onEdit={onEdit} />);
      await user.click(screen.getByRole('button', { name: /edit/i }));
      expect(onEdit).toHaveBeenCalledWith(mockItem);
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('does not call onEdit twice on rapid double-click (debounced)', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} onEdit={onEdit} />);
      await user.dblClick(screen.getByRole('button', { name: /edit/i }));
      expect(onEdit).toHaveBeenCalledTimes(1); // Button should be disabled after first click
    });

    it('opens delete confirmation dialog when delete is clicked', async () => {
      const user = userEvent.setup();
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} onDelete={vi.fn()} />);
      await user.click(screen.getByRole('button', { name: /delete/i }));
      expect(screen.getByRole('dialog', { name: /confirm/i })).toBeVisible();
    });

    it('calls onDelete after user confirms deletion', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} onDelete={onDelete} />);
      await user.click(screen.getByRole('button', { name: /delete/i }));
      const dialog = screen.getByRole('dialog', { name: /confirm/i });
      await user.click(within(dialog).getByRole('button', { name: /confirm/i }));
      expect(onDelete).toHaveBeenCalledWith(mockItem.$id);
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('does NOT call onDelete when user cancels the dialog', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} onDelete={onDelete} />);
      await user.click(screen.getByRole('button', { name: /delete/i }));
      const dialog = screen.getByRole('dialog', { name: /confirm/i });
      await user.click(within(dialog).getByRole('button', { name: /cancel/i }));
      expect(onDelete).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); // Dialog closed
    });

    it('closes the delete dialog after successful deletion', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn().mockResolvedValue({ success: true });
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} onDelete={onDelete} />);
      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));
      await vi.waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // ═══════════════════════════════════════════
  // CLASS 4: LOADING / PENDING STATES
  // ═══════════════════════════════════════════
  describe('Loading States', () => {
    it('disables delete button while deletion is in progress', async () => {
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} isDeleting={true} />);
      expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
    });

    it('shows a loading indicator while isDeleting is true', () => {
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} isDeleting={true} />);
      expect(screen.getByRole('status', { name: /deleting/i })).toBeInTheDocument();
    });

    it('shows the item in a visual pending state when isPending is true', () => {
      const pendingItem = { ...mockItem, _pending: true };
      render(<ItemCard item={pendingItem} currentUserId={OWNER.$id} />);
      const article = screen.getByRole('article');
      // Card should indicate pending (opacity, disabled controls, or aria-busy)
      expect(article).toHaveAttribute('aria-busy', 'true');
    });
  });

  // ═══════════════════════════════════════════
  // CLASS 5: EDGE CASES / DATA VARIATIONS
  // ═══════════════════════════════════════════
  describe('Edge Cases', () => {
    it('renders gracefully when item has no content (optional field)', () => {
      const noContentItem = { ...mockItem, content: null };
      expect(() =>
        render(<ItemCard item={noContentItem} currentUserId={OWNER.$id} />)
      ).not.toThrow();
    });

    it('renders gracefully when title is very long (100 characters)', () => {
      const longTitleItem = { ...mockItem, title: 'A'.repeat(100) };
      render(<ItemCard item={longTitleItem} currentUserId={OWNER.$id} />);
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('renders draft items with a draft status indicator', () => {
      const draftItem = { ...mockItem, status: 'draft' };
      render(<ItemCard item={draftItem} currentUserId={OWNER.$id} />);
      expect(screen.getByText(/draft/i)).toBeVisible();
    });

    it('renders archived items with an archived indicator', () => {
      const archivedItem = { ...mockItem, status: 'archived' };
      render(<ItemCard item={archivedItem} currentUserId={OWNER.$id} />);
      expect(screen.getByText(/archived/i)).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════
  // CLASS 6: ACCESSIBILITY
  // ═══════════════════════════════════════════
  describe('Accessibility', () => {
    it('edit button has a descriptive accessible name including the item title', () => {
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} />);
      // "Edit" alone is not accessible — must describe WHAT is being edited
      expect(
        screen.getByRole('button', { name: /edit TypeScript Mastery/i })
      ).toBeInTheDocument();
    });

    it('delete button has a descriptive accessible name', () => {
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} />);
      expect(
        screen.getByRole('button', { name: /delete TypeScript Mastery/i })
      ).toBeInTheDocument();
    });

    it('confirmation dialog traps focus (focus is inside dialog after opening)', async () => {
      const user = userEvent.setup();
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} onDelete={vi.fn()} />);
      await user.click(screen.getByRole('button', { name: /delete/i }));
      const dialog = screen.getByRole('dialog');
      expect(dialog).toContainElement(document.activeElement);
    });
  });

  // ═══════════════════════════════════════════
  // CLASS 7: ERROR STATES
  // ═══════════════════════════════════════════
  describe('Error States', () => {
    it('shows an error message when deletion fails', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn().mockRejectedValue(new Error('Server error'));
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} onDelete={onDelete} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      expect(await screen.findByRole('alert')).toBeVisible();
      expect(screen.getByText(/failed to delete/i)).toBeVisible();
    });

    it('re-enables the delete button after a failed deletion', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn().mockRejectedValue(new Error('Error'));
      render(<ItemCard item={mockItem} currentUserId={OWNER.$id} onDelete={onDelete} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await vi.waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).not.toBeDisabled();
      });
    });
  });
});
```
