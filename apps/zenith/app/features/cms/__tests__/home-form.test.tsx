// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeForm } from '../components/sections/home-form';
import { CmsStatusFooter } from '../components/status-footer';
import { CmsProvider } from '../context/cms-context';

describe('HomeForm (US1)', () => {
  it('renders correctly with initial identity baseline', () => {
    render(
      <CmsProvider>
        <HomeForm />
      </CmsProvider>,
    );

    expect(screen.getByText(/Home/i)).toBeDefined();
    const nameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('');
    expect(screen.getByLabelText(/Headline/i)).toBeDefined();
  });

  it('toggles saving state when save button is clicked', async () => {
    render(
      <CmsProvider>
        <HomeForm />
        <CmsStatusFooter />
      </CmsProvider>,
    );

    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);

    expect(await screen.findByText(/Synchronizing/i)).toBeDefined();
    expect(
      await screen.findByText(/Save Changes/i, {}, { timeout: 1500 }),
    ).toBeDefined();
  });

  it('updates form state on input change', () => {
    render(
      <CmsProvider>
        <HomeForm />
      </CmsProvider>,
    );
    const nameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Tiago Poli' } });
    expect(nameInput.value).toBe('Tiago Poli');
  });
});
