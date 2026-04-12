/**
 * Composite Pattern — UserProfile broken into focused sub-components
 *
 * Unlike Compound (shared context), Composite uses explicit props and forwardRef.
 * Each piece is independently testable and reusable.
 *
 * Usage:
 * <UserProfile.Root>
 *   <UserProfile.Avatar src={user.avatar} alt={user.name} />
 *   <UserProfile.Info name={user.name} bio={user.bio} />
 *   <UserProfile.Actions onEdit={handleEdit} onDelete={handleDelete} />
 * </UserProfile.Root>
 */

import { type ComponentPropsWithoutRef, forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ─── Root ─────────────────────────────────────────────────────────
interface RootProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
}

const Root = forwardRef<HTMLDivElement, RootProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-start gap-4 rounded-xl border bg-card p-6 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Root.displayName = 'UserProfile.Root'

// ─── Avatar ───────────────────────────────────────────────────────
interface AvatarProps extends ComponentPropsWithoutRef<'img'> {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
}

const avatarSizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
} as const

const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ src, alt, size = 'md', className, ...props }, ref) => (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={cn(
        'shrink-0 rounded-full object-cover ring-2 ring-background',
        avatarSizes[size],
        className
      )}
      {...props}
    />
  )
)
Avatar.displayName = 'UserProfile.Avatar'

// ─── Info ─────────────────────────────────────────────────────────
interface InfoProps extends ComponentPropsWithoutRef<'div'> {
  name: string
  bio?: string
  role?: string
}

const Info = forwardRef<HTMLDivElement, InfoProps>(
  ({ name, bio, role, className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1 min-w-0', className)} {...props}>
      <h3 className="text-sm font-semibold leading-none truncate">{name}</h3>
      {role && (
        <span className="text-xs text-muted-foreground">{role}</span>
      )}
      {bio && (
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{bio}</p>
      )}
    </div>
  )
)
Info.displayName = 'UserProfile.Info'

// ─── Actions ──────────────────────────────────────────────────────
interface ActionsProps extends ComponentPropsWithoutRef<'div'> {
  onEdit?: () => void
  onDelete?: () => void
}

const Actions = forwardRef<HTMLDivElement, ActionsProps>(
  ({ onEdit, onDelete, className, ...props }, ref) => (
    <div ref={ref} className={cn('flex gap-2 ml-auto shrink-0', className)} {...props}>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Edit
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-destructive hover:text-destructive/80 transition-colors"
        >
          Delete
        </button>
      )}
    </div>
  )
)
Actions.displayName = 'UserProfile.Actions'

// ─── Assembled Export ─────────────────────────────────────────────
export const UserProfile = Object.assign(Root, {
  Avatar,
  Info,
  Actions,
})
