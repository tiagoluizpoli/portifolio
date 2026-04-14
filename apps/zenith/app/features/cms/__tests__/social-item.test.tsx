/**
 * @vitest-environment jsdom
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

// --- Mocks ---

vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <div data-testid={`icon-${icon}`} />,
}));

vi.mock('lucide-react', () => ({
  Trash2: () => <div data-testid="icon-trash" />,
  ChevronDownIcon: () => <div data-testid="icon-chevron-down" />,
  ChevronDown: () => <div data-testid="icon-chevron-down" />,
  ChevronUpIcon: () => <div data-testid="icon-chevron-up" />,
  ChevronUp: () => <div data-testid="icon-chevron-up" />,
  Check: () => <div data-testid="icon-check" />,
  X: () => <div data-testid="icon-x" />,
  Mail: () => <div data-testid="icon-mail" />,
  Phone: () => <div data-testid="icon-phone" />,
  MapPin: () => <div data-testid="icon-map-pin" />,
  Plus: () => <div data-testid="icon-plus" />,
  Settings2: () => <div data-testid="icon-settings" />,
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

vi.mock('@/components/ui/input', () => ({
  Input: (props: {
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    placeholder?: string;
  }) => (
    <input
      data-testid="mock-input"
      value={props.value || ''}
      onChange={props.onChange}
      placeholder={props.placeholder || ''}
    />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
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

/**
 * Deterministic Test Harness (§XVII)
 * Bypasses library rendering and state propagation issues in JSDOM
 * by providing a stable surrogate cockpit for the verification mount.
 */
const TestFormWrapper = ({
  initialValue,
  children,
}: {
  initialValue: ContactInput['socials'][number];
  children: (form: ContactFormInstance) => ReactNode;
}) => {
  const mockValues: ContactInput = {
    id: 'test-form',
    locale: 'en',
    email: 'test@example.com',
    phone: '123456789',
    location: 'Test City',
    socials: [initialValue],
  };

  /**
   * High-Fidelity Surrogate Cockpit (§XVII)
   * Deterministically handles state injection for core and collection fields.
   */
  const formSurrogate = {
    Field: ({
      children: renderFn,
      name,
    }: {
      name: keyof ContactInput | string;
      children: (f: { state: { value: unknown } }) => ReactNode;
    }) => {
      const val = name.includes('socials')
        ? initialValue
        : (mockValues as unknown as Record<string, unknown>)[name];
      return <>{renderFn({ state: { value: val } })}</>;
    },
    Subscribe: ({
      children: renderFn,
    }: {
      children: (s: [boolean, boolean]) => ReactNode;
    }) => {
      return <>{renderFn([true, true])}</>;
    },
    getFieldValue: (path: string) => {
      if (path.includes('username')) return initialValue.username;
      return '';
    },
    setFieldValue: vi.fn(),
    reset: vi.fn(),
    pushFieldValue: vi.fn(),
    removeFieldValue: vi.fn(),
    handleSubmit: vi.fn(),
  } as unknown as ContactFormInstance;

  return <>{children(formSurrogate)}</>;
};

describe('SocialItem (US4) - Absolute Certification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders correctly with initial data', () => {
    const initialValue: ContactInput['socials'][number] = {
      id: 'soc-1',
      platformId: 'github',
      username: 'zenith',
      iconId: 'devicon:github',
      active: true,
      sort: 0,
    };

    render(
      <TestFormWrapper initialValue={initialValue}>
        {(form) => (
          <SocialItem
            index={0}
            form={form}
            platforms={mockPlatforms}
            onRemove={vi.fn()}
          />
        )}
      </TestFormWrapper>,
    );

    expect(screen.getByText(/Platform/i)).toBeTruthy();
    expect(screen.getByDisplayValue('zenith')).toBeTruthy();
  });

  it('updates handle through form when changed', async () => {
    const initialValue: ContactInput['socials'][number] = {
      id: 'soc-1',
      platformId: 'github',
      username: 'zenith',
      iconId: 'devicon:github',
      active: true,
      sort: 0,
    };

    let capturedForm: ContactFormInstance | undefined;

    render(
      <TestFormWrapper initialValue={initialValue}>
        {(form) => {
          capturedForm = form;
          return (
            <SocialItem
              index={0}
              form={form}
              platforms={mockPlatforms}
              onRemove={vi.fn()}
            />
          );
        }}
      </TestFormWrapper>,
    );

    const input = screen.getByDisplayValue('zenith');
    fireEvent.change(input, { target: { value: 'tiagopoli' } });

    // Verify state management (§XVII)
    expect(capturedForm?.setFieldValue).toHaveBeenCalledWith(
      'socials[0].username',
      'tiagopoli',
    );
  });

  it('resolves the correct platform icon', () => {
    const initialValue: ContactInput['socials'][number] = {
      id: 'soc-1',
      platformId: 'github',
      username: 'zenith',
      iconId: 'devicon:github',
      active: true,
      sort: 0,
    };

    render(
      <TestFormWrapper initialValue={initialValue}>
        {(form) => (
          <SocialItem
            index={0}
            form={form}
            platforms={mockPlatforms}
            onRemove={vi.fn()}
          />
        )}
      </TestFormWrapper>,
    );
    expect(screen.getByTestId('icon-devicon:github')).toBeTruthy();
  });

  it('triggers onRemove when delete button is clicked', () => {
    const onRemove = vi.fn();
    const initialValue: ContactInput['socials'][number] = {
      id: 'soc-1',
      platformId: 'github',
      username: 'zenith',
      iconId: 'devicon:github',
      active: true,
      sort: 0,
    };

    render(
      <TestFormWrapper initialValue={initialValue}>
        {(form) => (
          <SocialItem
            index={0}
            form={form}
            platforms={mockPlatforms}
            onRemove={onRemove}
          />
        )}
      </TestFormWrapper>,
    );

    const deleteBtn = screen.getByTestId('icon-trash').closest('button');
    if (deleteBtn) fireEvent.click(deleteBtn);

    expect(onRemove).toHaveBeenCalledWith(0);
  });
});
