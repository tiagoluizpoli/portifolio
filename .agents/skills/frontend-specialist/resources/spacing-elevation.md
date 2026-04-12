# Spacing & Elevation — The 4px Grid System

## The Grid

Every spatial value in the system is a multiple of 4px. No exceptions.

### Token Scale

| Token | px | rem | Common Use |
|:---|:---|:---|:---|
| `space-0` | 0 | 0 | Zero spacing |
| `space-px` | 1 | 0.0625 | Borders only |
| `space-0.5` | 2 | 0.125 | Hairline gaps |
| `space-1` | 4 | 0.25 | Icon padding, tiny gaps |
| `space-1.5` | 6 | 0.375 | Tight label spacing |
| `space-2` | 8 | 0.5 | Compact element gaps |
| `space-2.5` | 10 | 0.625 | Input padding (Y) |
| `space-3` | 12 | 0.75 | Default gap |
| `space-3.5` | 14 | 0.875 | — |
| `space-4` | 16 | 1.0 | Component padding |
| `space-5` | 20 | 1.25 | Card padding (compact) |
| `space-6` | 24 | 1.5 | Card padding (standard) |
| `space-7` | 28 | 1.75 | — |
| `space-8` | 32 | 2.0 | Section padding |
| `space-10` | 40 | 2.5 | Between sections |
| `space-12` | 48 | 3.0 | Large section gaps |
| `space-14` | 56 | 3.5 | — |
| `space-16` | 64 | 4.0 | Page section breaks |
| `space-20` | 80 | 5.0 | Hero spacing |
| `space-24` | 96 | 6.0 | Full page sections |

### Responsive Section Spacing

```css
.section-gap {
  padding-block: clamp(2rem, 1.5rem + 3vw, 5rem);
}
```

---

## Shadow Elevation System

Shadows represent hierarchy. More shadow = closer to user.

### Implementation

```css
:root {
  --shadow-none: none;
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

### Usage Guide

| Component | Rest State | Hover State | Active State |
|:---|:---|:---|:---|
| Card | `shadow-xs` | `shadow-sm` | `shadow-xs` |
| Dialog | `shadow-xl` | — | — |
| Dropdown | `shadow-lg` | — | — |
| Tooltip | `shadow-md` | — | — |
| Button | `shadow-xs` | `shadow-sm` | `shadow-none` |
| Toast | `shadow-lg` | — | — |

---

## Z-Index Convention

```css
:root {
  --z-behind: -1;     /* Background decorations */
  --z-base: 0;        /* Default content */
  --z-dropdown: 50;   /* Dropdown menus */
  --z-sticky: 100;    /* Sticky headers, toolbars */
  --z-overlay: 200;   /* Backdrop overlays */
  --z-modal: 300;     /* Modal dialogs */
  --z-popover: 400;   /* Popovers (above modals if needed) */
  --z-toast: 500;     /* Toast notifications */
  --z-tooltip: 600;   /* Tooltips (always on top) */
}
```

**Rules**:
1. Never use arbitrary z-index values (z-[999], z-[9999])
2. Each layer has a defined range
3. Components within a layer stack naturally (DOM order)
4. Only use z-index when two elements ACTUALLY overlap

---

## Border Radius Convention

| Token | Value | Use |
|:---|:---|:---|
| `rounded-sm` | 0.125rem (2px) | Tiny chips, badges |
| `rounded` | 0.25rem (4px) | Inline code, tags |
| `rounded-md` | 0.375rem (6px) | Buttons, inputs |
| `rounded-lg` | 0.5rem (8px) | Cards (compact) |
| `rounded-xl` | 0.75rem (12px) | Cards (standard) |
| `rounded-2xl` | 1rem (16px) | Dialogs, large cards |
| `rounded-3xl` | 1.5rem (24px) | Feature sections |
| `rounded-full` | 9999px | Avatars, pills |
