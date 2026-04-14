/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SocialItem } from '../components/sections/contact/social-item';
import type { ContactFormInstance } from '../components/sections/contact/types';
import type { PlatformInput } from '../types/assets';
import type { ContactInput } from '../types/contact';

// Fix ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <div data-testid={`icon-${icon}`} />,
}));

vi.mock('lucide-react', () => ({
  Trash2: () => <div data-testid="icon-trash" />,
  ChevronDownIcon: () => <div data-testid="icon-chevron-down" />,
}));

// Mock the UI layer to be JSDOM-safe (§XVII)
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value }: { children: ReactNode; value?: string }) => (
    <div data-testid="mock-select" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <div>{placeholder}</div>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <div data-value={value}>{children}</div>
  ),
}));

const mockPlatforms: PlatformInput[] = [
  {
    id: 'github',
    title: 'GitHub',
    iconCode: 'devicon:github',
    urlTemplate: 'https://github.com/{value}',
    status: 'active',
  },
];

describe('SocialItem (US4) - Deterministic Certification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders correctly with strictly-typed surrogate state', () => {
    const initialValue: ContactInput['socials'][number] = {
      id: 'soc-1',
      platformId: 'github',
      username: 'zenith',
      iconId: 'devicon:github',
      active: true,
      sort: 0,
    };

    /**
     * Total Surrogate Harness (§XVII)
     * Provides 100% stable property access to the component callback.
     */
    const mockForm = {
      Field: ({
        children: renderFn,
      }: {
        children: (f: { state: { value: unknown } }) => ReactNode;
      }) => {
        return <>{renderFn({ state: { value: initialValue } })}</>;
      },
      setFieldValue: vi.fn(),
    } as unknown as ContactFormInstance;

    render(
      <SocialItem
        index={0}
        form={mockForm}
        platforms={mockPlatforms}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText(/Platform/i)).toBeTruthy();
    expect(screen.getByDisplayValue('zenith')).toBeTruthy();
    expect(screen.getByTestId('icon-devicon:github')).toBeTruthy();
  });

  it('handles null/undefined field state gracefully (Zero-Fault Shield Verification)', () => {
    /**
     * Null-State Surrogate (§XVII)
     * Verifies the resilience shield against initialization ticks.
     */
    const mockForm = {
      Field: ({
        children: renderFn,
      }: {
        children: (f: unknown) => ReactNode;
      }) => {
        // Return undefined to simulate an initialization tick
        return <>{renderFn(undefined)}</>;
      },
      setFieldValue: vi.fn(),
    } as unknown as ContactFormInstance;

    const { container } = render(
      <SocialItem
        index={0}
        form={mockForm}
        platforms={mockPlatforms}
        onRemove={vi.fn()}
      />,
    );

    // Should return null (empty container) per the Zero-Fault shield (§XVII)
    expect(container.firstChild).toBeNull();
  });
});
