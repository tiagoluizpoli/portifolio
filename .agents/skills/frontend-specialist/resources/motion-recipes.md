# Motion Recipes — Spring Physics Cookbook

Every animation in this system uses spring physics. No linear easing. No cubic-bezier unless explicitly justified.

---

## Spring Parameter Reference

| Parameter | Effect | Low Value | High Value |
|:---|:---|:---|:---|
| **Stiffness** | How snappy the spring. Higher = faster response | 50 (lazy) | 600 (snappy) |
| **Damping** | How quickly oscillation stops. Higher = less bounce | 5 (bouncy) | 40 (dead stop) |
| **Mass** | Weight of the object. Higher = more momentum | 0.5 (light) | 3.0 (heavy) |

---

## Recipe Catalog

### 1. Button Press
```tsx
// Scale-down on click, scale-up on release
const buttonSpring = {
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }
}
```
**Feel**: Snappy, responsive. Like pressing a real button.

### 2. Button Hover Lift
```tsx
const hoverLift = {
  whileHover: { y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  transition: { type: 'spring', stiffness: 200, damping: 20 }
}
```
**Feel**: Subtle elevation. Card "lifts" from the surface.

### 3. Modal / Dialog Enter
```tsx
const modalEnter = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
  transition: {
    type: 'spring', stiffness: 300, damping: 25,
    opacity: { duration: 0.15 }  // Opacity transitions faster
  }
}
```
**Feel**: Premium entrance, not jarring. Subtle scale + shift.

### 4. Backdrop / Overlay
```tsx
const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: 'easeOut' }
}
```
**Feel**: Quick, non-distracting. Opacity-only for performance.

### 5. List Item Stagger
```tsx
const listContainer = {
  animate: { transition: { staggerChildren: 0.05 } }
}
const listItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 100, damping: 15 }
}
```
**Feel**: Waterfall cascade. Each item slides in slightly after the previous.

### 6. Page / Route Transition
```tsx
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { type: 'spring', stiffness: 150, damping: 20, mass: 1.2 }
}
```
**Feel**: Weighty page shift. Content slides up into place.

### 7. Tooltip Appear
```tsx
const tooltip = {
  initial: { opacity: 0, scale: 0.95, y: 4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }
}
```
**Feel**: Quick, precise. Appears almost instantly but with spring softness.

### 8. Drawer / Sidebar Slide
```tsx
const drawer = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
  transition: { type: 'spring', stiffness: 200, damping: 25, mass: 1.5 }
}
```
**Feel**: Weighty slide. Like pushing a real drawer.

### 9. Error Shake
```tsx
const errorShake = {
  animate: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.4 }
  }
}
```
**Feel**: Physical rejection. Input literally shakes "no."

### 10. Accordion Expand
```tsx
const accordionContent = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: {
    height: { type: 'spring', stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 }
  }
}
```

### 11. Notification Toast Enter
```tsx
const toastEnter = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, x: 100, scale: 0.9 },
  transition: { type: 'spring', stiffness: 200, damping: 20 }
}
```
**Feel**: Slides up from bottom, exits to the right.

### 12. Floating Micro-Motion (Perpetual)
```tsx
const float = {
  animate: {
    y: [0, -4, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}
```
**Feel**: Living, breathing UI. Subtle perpetual movement.

### 13. Skeleton Shimmer (CSS)
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted-foreground) / 0.1) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
}
```

### 14. Focus Ring Pulse
```css
@keyframes focusPulse {
  0%, 100% { box-shadow: 0 0 0 2px hsl(var(--ring)); }
  50% { box-shadow: 0 0 0 4px hsl(var(--ring) / 0.5); }
}
.focus-pulse:focus-visible {
  animation: focusPulse 2s infinite;
}
```

### 15. Counter / Number Roll
```tsx
const numberRoll = {
  key: value, // Force re-mount on change
  initial: { y: 10, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -10, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 25 }
}
```
**Feel**: Numbers roll up/down into place.

---

## Reduced Motion Fallback

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const safeTransition = prefersReducedMotion
  ? { duration: 0 }
  : { type: 'spring', stiffness: 300, damping: 25 }
```

Always test with reduced motion enabled. Animations should degrade to instant transitions, never break.
