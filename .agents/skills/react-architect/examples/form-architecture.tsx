/**
 * Form Architecture — react-hook-form + Zod + shadcn
 *
 * Demonstrates the production form pattern:
 * 1. Zod schema (single source of truth)
 * 2. react-hook-form with zodResolver
 * 3. shadcn Form primitives for consistent UI
 * 4. Server error handling
 * 5. Multi-field validation
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { cn } from '@/lib/utils'

// ─── 1. Schema (Single Source of Truth) ───────────────────────────
// This schema is shared between the form AND the server action.
// Change it here, and both sides update automatically.

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  role: z
    .enum(['admin', 'editor', 'viewer'], {
      required_error: 'Please select a role',
    }),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
  }),
})

type CreateUserFormData = z.infer<typeof createUserSchema>

// ─── 2. Form Component ───────────────────────────────────────────

export function CreateUserForm() {
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: undefined,
      bio: '',
      notifications: {
        email: true,
        push: false,
      },
    },
  })

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form

  // ─── 3. Submit Handler ──────────────────────────────────────────
  const onSubmit = async (data: CreateUserFormData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()

        // Handle field-specific server errors
        if (error.field) {
          setError(error.field as keyof CreateUserFormData, {
            message: error.message,
          })
          return
        }

        // Handle general server errors
        setError('root', { message: error.message || 'Failed to create user' })
        return
      }

      // Success — redirect, toast, etc.
    } catch {
      setError('root', { message: 'Network error. Please try again.' })
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-lg"
      noValidate
    >
      {/* Root-level error (server errors, network errors) */}
      {errors.root && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3"
        >
          <p className="text-sm text-destructive">{errors.root.message}</p>
        </div>
      )}

      {/* Name Field */}
      <FormField
        label="Full Name"
        error={errors.name?.message}
        required
      >
        <input
          {...register('name')}
          type="text"
          placeholder="John Doe"
          className={cn(
            'flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            errors.name && 'border-destructive focus-visible:ring-destructive'
          )}
        />
      </FormField>

      {/* Email Field */}
      <FormField
        label="Email"
        error={errors.email?.message}
        required
      >
        <input
          {...register('email')}
          type="email"
          placeholder="john@example.com"
          className={cn(
            'flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            errors.email && 'border-destructive focus-visible:ring-destructive'
          )}
        />
      </FormField>

      {/* Role Select */}
      <FormField
        label="Role"
        error={errors.role?.message}
        required
      >
        <select
          {...register('role')}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            !form.getValues('role') && 'text-muted-foreground',
            errors.role && 'border-destructive'
          )}
        >
          <option value="" disabled>Select a role...</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </FormField>

      {/* Bio Textarea */}
      <FormField
        label="Bio"
        error={errors.bio?.message}
        helperText={`${form.watch('bio')?.length || 0}/500`}
      >
        <textarea
          {...register('bio')}
          rows={3}
          placeholder="Tell us about yourself..."
          className={cn(
            'flex w-full rounded-lg border bg-background px-3 py-2 text-sm',
            'placeholder:text-muted-foreground resize-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            errors.bio && 'border-destructive'
          )}
        />
      </FormField>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'inline-flex h-10 w-full items-center justify-center rounded-lg',
          'bg-primary px-4 text-sm font-medium text-primary-foreground',
          'hover:bg-primary/90 transition-colors',
          'disabled:pointer-events-none disabled:opacity-50'
        )}
      >
        {isSubmitting ? 'Creating...' : 'Create User'}
      </button>
    </form>
  )
}

// ─── 4. FormField Wrapper ─────────────────────────────────────────
// Consistent field layout: Label → Input → Error/Helper

interface FormFieldProps {
  label: string
  error?: string
  helperText?: string
  required?: boolean
  children: React.ReactNode
}

function FormField({ label, error, helperText, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}
