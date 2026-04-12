# RTL Patterns — React Testing Library Reference

---

## Query Priority Hierarchy

Use queries in this order — from most to least user-centric:

```
1. getByRole          → Best. Matches by ARIA role + accessible name
2. getByLabelText     → For form inputs with associated labels
3. getByPlaceholderText → For inputs without labels (less ideal)
4. getByText          → For visible text content
5. getByDisplayValue  → For select/input current value
6. getByAltText       → For img alt text
7. getByTitle         → For title attributes
8. getByTestId        → Last resort. Avoid. Only for non-semantic elements.
```

**Never**: `document.querySelector`, `container.querySelector`, raw DOM queries.

---

## Common Query Recipes

```typescript
// Buttons
screen.getByRole('button', { name: /save/i });
screen.getByRole('button', { name: 'Edit TypeScript skill' }); // Full accessible name

// Form inputs
screen.getByRole('textbox', { name: /skill name/i });
screen.getByLabelText(/level/i);
screen.getByRole('combobox', { name: /category/i }); // Select element

// Dialogs
screen.getByRole('dialog');
screen.getByRole('dialog', { name: /add skill/i }); // When dialog has accessible title

// Lists
screen.getByRole('list', { name: /skills/i });
screen.getAllByRole('listitem');

// Headings
screen.getByRole('heading', { name: /skills/i, level: 1 });

// Navigation
screen.getByRole('navigation', { name: /main navigation/i });
screen.getByRole('link', { name: /about/i });
```

---

## The `within` Scoping Pattern

```typescript
// In a list of skill cards, target a specific card
const typeScriptCard = screen.getByRole('article', { name: /typescript/i });
const editButton = within(typeScriptCard).getByRole('button', { name: /edit/i });
await userEvent.click(editButton);
// This ensures we click the RIGHT edit button, not any first one found
```

---

## Form Testing Patterns

```typescript
it('submits the form with valid data', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<SkillForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/name/i), 'TypeScript');
  await user.clear(screen.getByLabelText(/level/i));
  await user.type(screen.getByLabelText(/level/i), '8');
  await user.selectOptions(screen.getByRole('combobox'), 'frontend');
  await user.click(screen.getByRole('button', { name: /save/i }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'TypeScript',
      level: 8,
      category: 'frontend',
    });
  });
});

it('shows validation errors when required fields are empty', async () => {
  const user = userEvent.setup();
  render(<SkillForm onSubmit={vi.fn()} />);

  // Submit without filling anything
  await user.click(screen.getByRole('button', { name: /save/i }));

  expect(await screen.findByText(/name is required/i)).toBeVisible();
  expect(screen.getByText(/category is required/i)).toBeVisible();
});

it('clears validation error when user fixes the field', async () => {
  const user = userEvent.setup();
  render(<SkillForm onSubmit={vi.fn()} />);

  await user.click(screen.getByRole('button', { name: /save/i }));
  expect(await screen.findByText(/name is required/i)).toBeVisible();

  await user.type(screen.getByLabelText(/name/i), 'React');
  await user.tab(); // Trigger blur

  await waitFor(() => {
    expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
  });
});
```

---

## Async / Loading State Testing

```typescript
it('shows a loading skeleton while data is fetching', () => {
  // Mock the query in pending state
  const queryClient = new QueryClient();
  queryClient.setQueryData(['skills'], undefined); // No data yet

  render(
    <QueryClientProvider client={queryClient}>
      <SkillsList />
    </QueryClientProvider>
  );

  expect(screen.getByRole('status', { name: /loading/i })).toBeVisible();
});

it('renders skills after successful load', async () => {
  mockAppwriteSuccess({ documents: [mockSkill], total: 1 });

  render(<SkillsList />);

  await screen.findByText('TypeScript'); // findBy waits for element to appear
  expect(screen.getByText('TypeScript')).toBeVisible();
});

it('shows error state when load fails', async () => {
  mockAppwriteError(500);

  render(<SkillsList />);

  expect(await screen.findByRole('alert')).toBeVisible();
  expect(screen.getByText(/something went wrong/i)).toBeVisible();
});
```

---

## Mutation / Interaction Testing

```typescript
it('calls delete mutation when user confirms deletion', async () => {
  const user = userEvent.setup();
  const deleteMock = vi.fn().mockResolvedValue({ success: true });
  render(<SkillCard skill={mockSkill} onDelete={deleteMock} />);

  // Click delete
  await user.click(screen.getByRole('button', { name: /delete/i }));

  // Confirm in dialog
  const confirmDialog = screen.getByRole('dialog', { name: /confirm/i });
  await user.click(within(confirmDialog).getByRole('button', { name: /confirm/i }));

  expect(deleteMock).toHaveBeenCalledWith(mockSkill.$id);
  expect(deleteMock).toHaveBeenCalledTimes(1);
});

it('does not delete when user cancels the confirmation', async () => {
  const user = userEvent.setup();
  const deleteMock = vi.fn();
  render(<SkillCard skill={mockSkill} onDelete={deleteMock} />);

  await user.click(screen.getByRole('button', { name: /delete/i }));
  const confirmDialog = screen.getByRole('dialog', { name: /confirm/i });
  await user.click(within(confirmDialog).getByRole('button', { name: /cancel/i }));

  expect(deleteMock).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); // Dialog closed
});
```

---

## Accessibility Testing

```typescript
import { axe } from 'jest-axe'; // or vitest-axe

it('has no accessibility violations', async () => {
  const { container } = render(<SkillsPage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it('dialog has accessible title and description', () => {
  render(<AddSkillDialog open={true} />);
  expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby');
  expect(screen.getByRole('heading', { name: /add skill/i })).toBeInTheDocument();
});

it('error messages are associated with their inputs', async () => {
  const user = userEvent.setup();
  render(<SkillForm />);
  await user.click(screen.getByRole('button', { name: /save/i }));

  const nameInput = screen.getByLabelText(/name/i);
  const errorMessage = await screen.findByText(/name is required/i);

  // Input should reference the error via aria-describedby
  expect(nameInput).toHaveAttribute('aria-describedby');
  expect(nameInput.getAttribute('aria-describedby')).toBe(errorMessage.id);
});
```
