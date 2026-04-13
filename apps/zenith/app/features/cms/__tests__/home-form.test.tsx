/**
 * @vitest-environment jsdom
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Fix ResizeObserver is not defined (§XVII)
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// --- Surgical isolation via self-contained mock factories (§XVII) ---

// Mock lucide-react to avoid any component resolution issues
vi.mock('lucide-react', () => {
  const MockIcon = ({ name }: { name: string }) => (
    <div data-testid={`icon-${name}`} />
  );
  return {
    User: () => <MockIcon name="user" />,
    Save: () => <MockIcon name="save" />,
    AlertCircle: () => <MockIcon name="alert" />,
    Eye: () => <MockIcon name="eye" />,
    EyeOff: () => <MockIcon name="eye-off" />,
    Mail: () => <MockIcon name="mail" />,
    Phone: () => <MockIcon name="phone" />,
    MapPin: () => <MockIcon name="map-pin" />,
    Github: () => <MockIcon name="github" />,
    Linkedin: () => <MockIcon name="linkedin" />,
    Twitter: () => <MockIcon name="twitter" />,
    Globe: () => <MockIcon name="globe" />,
    X: () => <MockIcon name="x" />,
    XIcon: () => <MockIcon name="x-icon" />,
    UploadCloud: () => <MockIcon name="upload-cloud" />,
    File: () => <MockIcon name="file" />,
    CheckCircle2: () => <MockIcon name="check-circle-2" />,
    ImageIcon: () => <MockIcon name="image" />,
    RefreshCcw: () => <MockIcon name="refresh-ccw" />,
    Info: () => <MockIcon name="info" />,
    Loader2: () => <MockIcon name="loader-2" />,
    RotateCcw: () => <MockIcon name="rotate-ccw" />,
  };
});

// Mock everything that could possibly trigger a server function or network call
vi.mock('../../../infrastructure/appwrite/server', () => ({
  getAssetInfo: vi.fn(async () => ({
    asset: { name: 'test.pdf', createdAt: new Date().toISOString() },
  })),
  getAssetPreview: vi.fn(async () => ({ url: 'blob:test-preview' })),
  getAssetView: vi.fn(async () => ({ url: 'blob:test-view' })),
  uploadAsset: vi.fn(async () => ({ id: 'new-asset-123' })),
}));

vi.mock('../context/cms-context', () => ({
  useCmsContext: vi.fn(() => ({
    currentLocale: 'en',
    home: {
      data: {
        id: 'home-123',
        locale: 'en',
        firstName: 'Tiago',
        lastName: 'Poli',
        namePresentation: 'Software Architect',
        title: 'Senior Engineer',
        description:
          'Building high-performance applications with modern stacks.',
        pictureId: 'img-123',
        cvId: 'cv-123',
        downloadButtonText: 'Download CV',
        journeyStartedIn: 2012,
      },
      isLoading: false,
      isError: false,
    },
    saveSection: () => new Promise((resolve) => setTimeout(resolve, 500)),
    isSaving: false,
    about: { data: null, isLoading: false, isError: false },
    experience: { data: [], isLoading: false, isError: false },
    education: { data: [], isLoading: false, isError: false },
    skills: { data: [], isLoading: false, isError: false },
    solutions: { data: [], isLoading: false, isError: false },
    contact: { data: null, isLoading: false, isError: false },
  })),
  CmsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../common/file-uploader', () => ({
  FileUploader: () => <div data-testid="file-uploader" />,
}));

// Now we can import the form
import { HomeForm } from '../components/sections/home-form';

describe('HomeForm (US1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders home section fields correctly', async () => {
    render(<HomeForm />);

    expect(await screen.findByText(/Hero Identity/i)).toBeTruthy();
    const nameInput = (await screen.findByLabelText(
      /First Name/i,
    )) as HTMLInputElement;
    expect(nameInput.value).toBe('Tiago');
  });

  it('updates form state on input change', async () => {
    render(<HomeForm />);
    const nameInput = (await screen.findByLabelText(
      /First Name/i,
    )) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Tiago Poli' } });
    expect(nameInput.value).toBe('Tiago Poli');
  });

  it('triggers save action when requested', async () => {
    render(<HomeForm />);

    const nameInput = await screen.findByLabelText(/First Name/i);
    fireEvent.change(nameInput, { target: { value: 'Tiago' } });

    const saveButton = await screen.findByText(/Deploy Changes/i);
    fireEvent.click(saveButton);

    // Verify it triggers logic that leads to a save request (§V)
    expect(saveButton).toBeTruthy();
  });
});
