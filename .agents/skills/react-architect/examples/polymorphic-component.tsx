/**
 * Polymorphic Component — Box with `as` prop and full TypeScript inference
 *
 * The `as` prop lets consumers render this component as any HTML element
 * or another React component, while getting full autocomplete for that
 * element's props.
 *
 * Usage:
 * <Box as="section" className="p-4">Section content</Box>
 * <Box as="a" href="/about">Link styled as Box</Box>
 * <Box as={motion.div} animate={{ opacity: 1 }}>Animated Box</Box>
 */

import { type ComponentPropsWithoutRef, type ElementType, forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ─── Type Utilities ───────────────────────────────────────────────

/**
 * Extracts the props of a polymorphic component.
 * - Takes the component's own props (OwnProps)
 * - Adds the `as` prop
 * - Merges with the target element's native props
 * - Removes conflicts (OwnProps win over native props)
 */
type PolymorphicProps<
  E extends ElementType,
  OwnProps = object,
> = OwnProps &
  Omit<ComponentPropsWithoutRef<E>, keyof OwnProps | 'as'> & {
    as?: E
  }

/**
 * Extracts the ref type for a polymorphic component.
 */
type PolymorphicRef<E extends ElementType> =
  ComponentPropsWithoutRef<E> extends { ref?: infer R } ? R : never

// ─── Box Component ────────────────────────────────────────────────

type BoxOwnProps = {
  children?: ReactNode
  className?: string
}

type BoxProps<E extends ElementType = 'div'> = PolymorphicProps<E, BoxOwnProps>

/**
 * A polymorphic Box component.
 * Default element: `div`
 *
 * @example
 * <Box>Default div</Box>
 * <Box as="section">Renders as section</Box>
 * <Box as="a" href="/about">Renders as anchor — href is type-safe!</Box>
 */
export const Box = forwardRef(function Box<E extends ElementType = 'div'>(
  { as, className, children, ...props }: BoxProps<E>,
  ref: PolymorphicRef<E>
) {
  const Component = as || 'div'

  return (
    <Component ref={ref} className={cn(className)} {...props}>
      {children}
    </Component>
  )
}) as <E extends ElementType = 'div'>(
  props: BoxProps<E> & { ref?: PolymorphicRef<E> }
) => JSX.Element

// ─── Text Component (Polymorphic with variants) ───────────────────

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'overline'

const textStyles: Record<TextVariant, string> = {
  h1: 'text-3xl font-bold tracking-tight',
  h2: 'text-2xl font-semibold tracking-tight',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-medium',
  body: 'text-sm leading-relaxed',
  caption: 'text-xs text-muted-foreground',
  overline: 'text-[10px] font-semibold uppercase tracking-widest text-muted-foreground',
}

const defaultElements: Record<TextVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  caption: 'span',
  overline: 'span',
}

type TextOwnProps = {
  variant?: TextVariant
  children?: ReactNode
  className?: string
}

type TextProps<E extends ElementType = 'p'> = PolymorphicProps<E, TextOwnProps>

/**
 * A polymorphic Text component with semantic variants.
 *
 * @example
 * <Text variant="h1">Page Title</Text>
 * <Text variant="caption" as="time">2 hours ago</Text>
 * <Text variant="overline">Section Label</Text>
 */
export const Text = forwardRef(function Text<E extends ElementType = 'p'>(
  { as, variant = 'body', className, children, ...props }: TextProps<E>,
  ref: PolymorphicRef<E>
) {
  const Component = as || defaultElements[variant]

  return (
    <Component
      ref={ref}
      className={cn(textStyles[variant], className)}
      {...props}
    >
      {children}
    </Component>
  )
}) as <E extends ElementType = 'p'>(
  props: TextProps<E> & { ref?: PolymorphicRef<E> }
) => JSX.Element
