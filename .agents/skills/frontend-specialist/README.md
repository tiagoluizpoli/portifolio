# Frontend Specialist Skill

Elite UI/UX specialist focused on creating premium, psychologically engaging interfaces with mathematical precision.

## What This Skill Does

This skill transforms generic UIs into premium experiences by enforcing:
- **HSL Color Calibration** — engineered palettes, not picked at random
- **Mathematical Typography** — scales based on Major Third (1.25) or Perfect Fourth (1.333)
- **Spring Physics Motion** — 15+ pre-calibrated spring configs for every interaction type
- **4px Grid Spacing** — rigid spacing system with named tokens
- **APCA Accessibility** — contrast ratios that exceed WCAG 2.2

## Resources

| File | Contents |
|:---|:---|
| `resources/color-system.md` | HSL formulas, semantic tokens, dark mode mapping, palette generation |
| `resources/typography-system.md` | Font pairings, scale math, responsive clamp(), line heights |
| `resources/motion-recipes.md` | Spring configs for every interaction (button, modal, list, tooltip, etc.) |
| `resources/spacing-elevation.md` | 4px grid, shadow tokens, z-index conventions |
| `resources/accessibility-guide.md` | APCA tables, focus management, reduced motion, ARIA patterns |

## Examples

| File | Component |
|:---|:---|
| `examples/premium-button.tsx` | Gradient + inner shadow + spring hover + loading |
| `examples/glass-card.tsx` | Glassmorphism + noise texture + border glow |
| `examples/staggered-list.tsx` | Cascade entrance with intersection observer |
| `examples/animated-input.tsx` | Floating label + underline + focus glow + error shake |
| `examples/skeleton-loader.tsx` | Layout-matched skeleton with shimmer |
| `examples/page-transition.tsx` | Full-page spring transition |
| `examples/tooltip-micro.tsx` | Spring-animated tooltip with smart positioning |
| `examples/notification-toast.tsx` | Stacked toast with stagger dismiss |

## Safety Rules

1. No arbitrary px values — use 4px grid tokens
2. No arbitrary colors — use HSL-calibrated semantic tokens
3. No linear easings — use spring physics
4. No `!important` — use utility-first composition
5. Always check APCA contrast (Lc ≥ 60 for interactive, Lc ≥ 75 for body text)
6. Always provide `prefers-reduced-motion` fallbacks
