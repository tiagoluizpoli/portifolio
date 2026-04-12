# v3 → v4 Migration — EXHAUSTIVE Replacement Table

Every deprecated class with its exact replacement. Search this file when you encounter ANY yellow highlighting or deprecation warning.

---

## Flex Utilities

| v3 (Deprecated) | v4 (Replacement) | Notes |
|:---|:---|:---|
| `flex-shrink-0` | `shrink-0` | Shortened name |
| `flex-shrink` | `shrink` | Shortened name |
| `flex-grow-0` | `grow-0` | Shortened name |
| `flex-grow` | `grow` | Shortened name |

## Gradient Utilities

| v3 (Deprecated) | v4 (Replacement) |
|:---|:---|
| `bg-gradient-to-t` | `bg-linear-to-t` |
| `bg-gradient-to-tr` | `bg-linear-to-tr` |
| `bg-gradient-to-r` | `bg-linear-to-r` |
| `bg-gradient-to-br` | `bg-linear-to-br` |
| `bg-gradient-to-b` | `bg-linear-to-b` |
| `bg-gradient-to-bl` | `bg-linear-to-bl` |
| `bg-gradient-to-l` | `bg-linear-to-l` |
| `bg-gradient-to-tl` | `bg-linear-to-tl` |

## Outline Utilities

| v3 (Deprecated) | v4 (Replacement) | Notes |
|:---|:---|:---|
| `outline-none` | `outline-hidden` | v4 `outline-none` sets `outline-style: none` (DIFFERENT behavior) |

## Text/Overflow Utilities

| v3 (Deprecated) | v4 (Replacement) |
|:---|:---|
| `overflow-ellipsis` | `text-ellipsis` |

## Box Decoration Utilities

| v3 (Deprecated) | v4 (Replacement) |
|:---|:---|
| `decoration-slice` | `box-decoration-slice` |
| `decoration-clone` | `box-decoration-clone` |

## Arbitrary Value Syntax

In v4, arbitrary values use **parentheses** instead of brackets for functional notation:

| v3 (Deprecated) | v4 (Replacement) |
|:---|:---|
| `shadow-[0_1px_2px_rgb(0,0,0)]` | `shadow-(0_1px_2px_rgb(0,0,0))` |
| `shadow-[inset_0_1px_0_rgb(255,255,255,0.1)]` | `shadow-(inset_0_1px_0_rgb(255,255,255,0.1))` |
| `ring-[3px]` | `ring-(3px)` |
| `blur-[2px]` | `blur-(2px)` |
| `backdrop-blur-[4px]` | `backdrop-blur-(4px)` |
| `inset-[10px]` | `inset-(10px)` |
| `text-[14px]` | `text-(14px)` |
| `w-[calc(100%-2rem)]` | `w-(calc(100%-2rem))` |
| `h-[100dvh]` | `h-(100dvh)` |
| `p-[clamp(1rem,3vw,2rem)]` | `p-(clamp(1rem,3vw,2rem))` |
| `tracking-[0.02em]` | `tracking-(0.02em)` |
| `leading-[1.5]` | `leading-(1.5)` |
| `rounded-[12px]` | `rounded-(12px)` |
| `z-[999]` | `z-(999)` |
| `gap-[clamp(1rem,2vw,2rem)]` | `gap-(clamp(1rem,2vw,2rem))` |
| `max-w-[65ch]` | `max-w-(65ch)` |
| `min-h-[100dvh]` | `min-h-(100dvh)` |
| `translate-x-[var(--offset)]` | `translate-x-(var(--offset))` |
| `border-[rgba(0,0,0,0.1)]` | `border-(rgba(0,0,0,0.1))` |
| `bg-[url('/bg.png')]` | `bg-(url('/bg.png'))` |
| `content-['']` | `content-('')` |
| `grid-cols-[repeat(auto-fill,minmax(200px,1fr))]` | `grid-cols-(repeat(auto-fill,minmax(200px,1fr)))` |

> **Rule**: Square brackets `[...]` are still valid for truly arbitrary one-off values, but parentheses `(...)` are the new functional notation. When in doubt, use parentheses.

## Opacity Utilities (REMOVED)

| v3 (Removed) | v4 (Replacement) |
|:---|:---|
| `bg-opacity-50` | `bg-[color]/50` (use `/` modifier) |
| `text-opacity-50` | `text-[color]/50` |
| `border-opacity-50` | `border-[color]/50` |
| `placeholder-opacity-50` | `placeholder-[color]/50` |
| `ring-opacity-50` | `ring-[color]/50` |
| `divide-opacity-50` | `divide-[color]/50` |

## Transform Utilities (REMOVED)

| v3 (Removed) | v4 (Replacement) |
|:---|:---|
| `transform` (standalone, was required to enable transforms) | removed — transforms apply automatically |
| `transform-gpu` | removed — GPU acceleration is automatic |
| `transform-cpu` | removed |
| `transform-none` | `transform-none` (unchanged — disables transforms) |

## Filter Utilities (REMOVED)

| v3 (Removed) | v4 (Replacement) |
|:---|:---|
| `filter` (standalone, was required to enable filters) | removed — filters apply automatically |
| `backdrop-filter` (standalone) | removed — backdrop filters apply automatically |

## Space/Divide Reverse (REMOVED)

| v3 (Removed) | v4 (Replacement) |
|:---|:---|
| `space-x-reverse` | removed — use explicit margins instead |
| `space-y-reverse` | removed — use explicit margins |
| `divide-x-reverse` | removed — use explicit borders |
| `divide-y-reverse` | removed — use explicit borders |

## Container (CHANGED)

| v3 | v4 |
|:---|:---|
| `container` (auto-responsive centering) | Must define your own with `@utility container { ... }` |

## Ring Width Default (CHANGED)

| v3 | v4 |
|:---|:---|
| `ring` (applies 3px ring) | `ring` (applies 1px ring — different default) |
| `ring-2` | `ring-2` (unchanged) |
| N/A | `ring-3` (NEW — for the old `ring` default) |

## Place/Content Utilities

| v3 (Deprecated) | v4 (Replacement) |
|:---|:---|
| `place-content-center` | `place-content-center` (unchanged) |
| `place-items-center` | `place-items-center` (unchanged) |
| `place-self-center` | `place-self-center` (unchanged) |

---

## Quick Grep Patterns

Use these regex patterns to find deprecated classes in your codebase:

```bash
# Find deprecated flex utilities
grep -rn 'flex-shrink\|flex-grow' --include='*.tsx' --include='*.jsx'

# Find deprecated gradient classes
grep -rn 'bg-gradient-to-' --include='*.tsx' --include='*.jsx'

# Find deprecated outline-none
grep -rn 'outline-none' --include='*.tsx' --include='*.jsx'

# Find deprecated opacity utilities
grep -rn 'bg-opacity-\|text-opacity-\|border-opacity-' --include='*.tsx' --include='*.jsx'

# Find bracket arbitrary values (potential → parentheses)
grep -rn '\[[0-9]' --include='*.tsx' --include='*.jsx' --include='*.css'
```
