# Theme Tokens Reference — @theme Block Guide

## Complete @theme Configuration

```css
@import "tailwindcss";

@theme {
  /* ──── Colors (OKLCH for perceptual uniformity) ──── */
  --color-background: oklch(0.985 0.002 250);
  --color-foreground: oklch(0.145 0.005 250);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.145 0.005 250);
  --color-popover: oklch(1 0 0);
  --color-popover-foreground: oklch(0.145 0.005 250);
  --color-primary: oklch(0.546 0.245 262.881);
  --color-primary-foreground: oklch(0.985 0.002 250);
  --color-secondary: oklch(0.945 0.01 250);
  --color-secondary-foreground: oklch(0.345 0.015 250);
  --color-muted: oklch(0.945 0.01 250);
  --color-muted-foreground: oklch(0.555 0.015 250);
  --color-accent: oklch(0.945 0.01 250);
  --color-accent-foreground: oklch(0.345 0.015 250);
  --color-destructive: oklch(0.577 0.245 27.325);
  --color-destructive-foreground: oklch(0.985 0.002 27);
  --color-border: oklch(0.895 0.008 250);
  --color-input: oklch(0.895 0.008 250);
  --color-ring: oklch(0.546 0.245 262.881);

  /* ──── Typography ──── */
  --font-sans: 'Geist', 'Satoshi', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;
  --font-display: 'Outfit', 'Cabinet Grotesk', var(--font-sans);

  /* Font sizes (Major Third 1.250 scale) */
  --text-xs: 0.64rem;
  --text-xs--line-height: 1rem;
  --text-sm: 0.80rem;
  --text-sm--line-height: 1.25rem;
  --text-base: 1rem;
  --text-base--line-height: 1.6rem;
  --text-lg: 1.25rem;
  --text-lg--line-height: 1.75rem;
  --text-xl: 1.563rem;
  --text-xl--line-height: 1.875rem;
  --text-2xl: 1.953rem;
  --text-2xl--line-height: 2.2rem;
  --text-3xl: 2.441rem;
  --text-3xl--line-height: 2.7rem;
  --text-4xl: 3.052rem;
  --text-4xl--line-height: 3.2rem;

  /* ──── Spacing (4px grid extensions) ──── */
  --spacing-18: 4.5rem;
  --spacing-68: 17rem;
  --spacing-76: 19rem;
  --spacing-84: 21rem;
  --spacing-88: 22rem;
  --spacing-92: 23rem;
  --spacing-100: 25rem;
  --spacing-112: 28rem;
  --spacing-128: 32rem;

  /* ──── Border Radius ──── */
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-4xl: 2rem;

  /* ──── Shadows ──── */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  /* ──── Animations ──── */
  --animate-shimmer: shimmer 1.5s ease-in-out infinite;
  --animate-fade-in: fadeIn 0.2s ease-out;
  --animate-slide-up: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  --animate-slide-down: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  --animate-scale-in: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  /* ──── Z-Index ──── */
  --z-dropdown: 50;
  --z-sticky: 100;
  --z-overlay: 200;
  --z-modal: 300;
  --z-popover: 400;
  --z-toast: 500;
  --z-tooltip: 600;

  /* ──── Breakpoints ──── */
  --breakpoint-xs: 475px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

## Dark Mode @theme Override

```css
@theme dark {
  --color-background: oklch(0.145 0.005 250);
  --color-foreground: oklch(0.945 0.005 250);
  --color-card: oklch(0.185 0.008 250);
  --color-card-foreground: oklch(0.945 0.005 250);
  --color-primary: oklch(0.609 0.228 262.881);
  --color-muted: oklch(0.225 0.008 250);
  --color-muted-foreground: oklch(0.605 0.015 250);
  --color-border: oklch(0.265 0.008 250);
  --color-input: oklch(0.265 0.008 250);
}
```

## Naming Convention

| Prefix | For |
|:---|:---|
| `--color-*` | Color tokens |
| `--font-*` | Font families |
| `--text-*` | Font sizes |
| `--spacing-*` | Spacing scale |
| `--radius-*` | Border radius |
| `--shadow-*` | Box shadows |
| `--animate-*` | Animations |
| `--z-*` | Z-index layers |
| `--breakpoint-*` | Responsive breakpoints |
