/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCmsContext } from '../../context/cms-context';
import { HomeForm } from './home-form';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock dependencies
vi.mock('../../context/cms-context', () => ({
  useCmsContext: vi.fn(),
}));

vi.mock('../common/file-uploader', () => ({
  FileUploader: ({ label }: { label: string }) => (
    <div data-testid="mock-file-uploader" data-label={label} />
  ),
}));

vi.mock('../common/cms-save-button', () => ({
  CmsSaveButton: () => <button type="button">Save</button>,
}));

vi.mock('../common/cms-discard-button', () => ({
  CmsDiscardButton: () => <button type="button">Discard</button>,
}));

describe('HomeForm (Phase 6 Restoration)', () => {
  const mockContext = {
    currentLocale: 'en',
    home: {
      data: {
        id: '1',
        firstName: 'Tiago',
        lastName: 'Poli',
        namePresentation: 'Tiago Luiz Poli',
        title: 'Software Architect',
        description: 'Building the future.',
        journeyStartedIn: 2010,
        pictureId: 'pic-123',
        cvId: 'cv-123',
        downloadButtonText: 'Download',
      },
      isLoading: false,
      isError: false,
    },
    saveSection: vi.fn(),
    isSaving: false,
  };

  beforeEach(() => {
    // biome-ignore lint/suspicious/noExplicitAny: mockContext is a deep partial of CmsContextType
    vi.mocked(useCmsContext).mockReturnValue(mockContext as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('TS-FE-001: Renders in a 1:1 split layout (lg:grid-cols-2)', () => {
    render(
      <TooltipProvider>
        <HomeForm />
      </TooltipProvider>,
    );

    // Expect the heading to be correct
    expect(screen.getByText(/Hero Identity/i)).toBeDefined();

    // Look for the grid container specifically
    const gridContainer = screen.getByTestId('home-split-grid');
    expect(gridContainer.className).toContain('lg:grid-cols-2');
    expect(gridContainer.className).toContain('gap-4');
  });

  it('TS-FE-004: CTA Button Label is present and correctly styled', () => {
    render(
      <TooltipProvider>
        <HomeForm />
      </TooltipProvider>,
    );

    const ctaLabel = screen.getByLabelText(/CTA Button Label/i);
    expect(ctaLabel).toBeDefined();
    expect(ctaLabel.className).toContain('h-11');
  });

  it('TS-FE-003: Journey Started input uses type="number" and no-spinner class', () => {
    render(
      <TooltipProvider>
        <HomeForm />
      </TooltipProvider>,
    );

    const journeyInput = screen.getByLabelText(/Base Year/i);
    expect(journeyInput.getAttribute('type')).toBe('number');
    expect(journeyInput.className).toContain('no-spinner');
  });

  it('TS-FE-002: Displays both Picture and CV uploaders in the right column', () => {
    render(
      <TooltipProvider>
        <HomeForm />
      </TooltipProvider>,
    );

    const uploaders = screen.getAllByTestId('mock-file-uploader');
    expect(uploaders.length).toBe(2);
  });
});
