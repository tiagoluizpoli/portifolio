# Plugin Authoring — v4 Custom Plugins

## @utility Directive

Create custom utilities directly in CSS:

```css
/* Simple utilities */
@utility content-auto {
  content-visibility: auto;
}

@utility scrollbar-hidden {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

@utility text-balance {
  text-wrap: balance;
}

@utility text-pretty {
  text-wrap: pretty;
}

@utility no-select {
  user-select: none;
  -webkit-user-select: none;
}

@utility gpu-accelerate {
  will-change: transform;
  transform: translateZ(0);
}
```

## @variant Directive

Create custom variants:

```css
/* Combine hover and focus into one */
@variant hocus (&:hover, &:focus-visible);

/* Group hover specific to sidebar */
@variant group-sidebar (.sidebar:hover &, .sidebar:focus-within &);

/* State machine variants */
@variant data-loading ([data-state="loading"] &);
@variant data-error ([data-state="error"] &);
@variant data-success ([data-state="success"] &);

/* Reduced motion */
@variant motion-safe (@media (prefers-reduced-motion: no-preference));
@variant motion-reduce (@media (prefers-reduced-motion: reduce));
```

## Keyframe Definitions

```css
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
```

## @layer Organization

```css
@layer theme, base, components, utilities;

@layer base {
  html {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    color: hsl(var(--foreground));
    background: hsl(var(--background));
  }

  * {
    border-color: hsl(var(--border));
  }
}

@layer components {
  /* Reusable component-level styles (use sparingly) */
  .prose-custom {
    max-width: 65ch;
    line-height: 1.6;
  }
}
```
