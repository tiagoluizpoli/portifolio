# Accessibility Guide — APCA & WCAG 2.2

## APCA Contrast (Advanced Perceptual Contrast Algorithm)

APCA is a more perceptually accurate contrast model than WCAG 2.1's luminance ratio. We use APCA Lc values.

### Required Contrast Levels

| Text Type | Min Lc | Example |
|:---|:---|:---|
| Body text (14-16px normal) | Lc 75 | Primary content |
| Body text (bold) | Lc 60 | Bold paragraphs |
| Large text (24px+) | Lc 60 | Headings |
| Large text (18px+ bold) | Lc 50 | Subheadings |
| Sub-text / captions | Lc 60 | Metadata, timestamps |
| Placeholder text | Lc 40 | Input hints |
| Disabled text | Lc 30 | Greyed out labels |
| Non-text (icons, borders) | Lc 45 | Decorative elements |
| Focus indicator | Lc 60 | Focus rings |

### Quick Reference (Common Pairs)

| Background | Text | Lc | Pass? |
|:---|:---|:---|:---|
| `#F9FAFB` (zinc-50) | `#18181B` (zinc-950) | ~104 | ✅ |
| `#F9FAFB` (zinc-50) | `#71717A` (zinc-500) | ~55 | ⚠️ Captions only |
| `#09090B` (zinc-950) | `#FAFAFA` (zinc-50) | ~106 | ✅ |
| `#09090B` (zinc-950) | `#A1A1AA` (zinc-400) | ~62 | ✅ Large text |
| `#3B82F6` (blue-500) | `#FFFFFF` (white) | ~60 | ✅ Buttons |

---

## Keyboard Navigation

### Tab Order
- All interactive elements must be reachable via Tab key
- Tab order must follow visual order (left-to-right, top-to-bottom)
- Use `tabindex="0"` for custom interactive elements
- Never use `tabindex > 0` (breaks natural order)
- Use `tabindex="-1"` for programmatically focusable elements (e.g., error messages)

### Focus Trapping (Modals)
When a modal/dialog opens:
1. Move focus to the first focusable element inside the modal
2. Tab must cycle only within the modal (trap)
3. Escape must close the modal
4. On close, return focus to the element that opened the modal

### Skip Navigation
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50">
  Skip to main content
</a>
```

---

## ARIA Patterns

### Commonly Needed
| Pattern | When | Key Attributes |
|:---|:---|:---|
| Live Region | Dynamic content updates (toasts, notifications) | `aria-live="polite"`, `role="status"` |
| Dialog | Modal dialogs | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Alert | Error messages, warnings | `role="alert"`, auto-announced |
| Tab Panel | Tabbed interfaces | `role="tablist"`, `role="tab"`, `role="tabpanel"` |
| Menu | Dropdown menus | `role="menu"`, `role="menuitem"`, arrow key nav |
| Combobox | Autocomplete inputs | `role="combobox"`, `aria-expanded`, `aria-activedescendant` |

### Screen Reader Text
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Reduced Motion

**Always provide this media query**:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

In JS (Framer Motion):
```tsx
import { useReducedMotion } from 'framer-motion'

function MyComponent() {
  const shouldReduceMotion = useReducedMotion()
  return (
    <motion.div
      animate={{ y: shouldReduceMotion ? 0 : [0, -5, 0] }}
    />
  )
}
```

---

## Form Accessibility Checklist

- [ ] Every input has a visible `<label>` or `aria-label`
- [ ] Required fields are marked with `aria-required="true"` and visual indicator
- [ ] Error messages are linked via `aria-describedby`
- [ ] Error messages use `role="alert"` for screen reader announcement
- [ ] Form submission errors are announced to screen readers
- [ ] Submit buttons are disabled during submission with `aria-disabled`
- [ ] Success/failure states are communicated via `aria-live` region
