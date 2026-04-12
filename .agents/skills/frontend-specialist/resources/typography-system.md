# Typography System — Mathematical Scale & Font Engineering

## Scale Mathematics

A typographic scale creates visual harmony by using a mathematical ratio between font sizes.

### Available Scales

| Name | Ratio | Formula | Best For |
|:---|:---|:---|:---|
| Minor Second | 1.067 | base × 1.067ⁿ | Extremely compact UIs |
| Major Second | 1.125 | base × 1.125ⁿ | Dense data tables |
| Minor Third | 1.200 | base × 1.200ⁿ | Dashboards, admin panels |
| **Major Third** | **1.250** | **base × 1.250ⁿ** | **Default for most apps** |
| Perfect Fourth | 1.333 | base × 1.333ⁿ | Marketing pages |
| Augmented Fourth | 1.414 | base × 1.414ⁿ | Editorial, blog |
| Golden Ratio | 1.618 | base × 1.618ⁿ | Hero sections, landing pages |

### Major Third Scale (1.250) — Full Token Set

Base = 1rem (16px)

| Step | Token | rem | px | Use |
|:---|:---|:---|:---|:---|
| -2 | `--text-xs` | 0.64 | 10.24 | Tiny labels, badges |
| -1 | `--text-sm` | 0.80 | 12.80 | Helper text, metadata |
| 0 | `--text-base` | 1.00 | 16.00 | Body text |
| 1 | `--text-lg` | 1.25 | 20.00 | Subheadings |
| 2 | `--text-xl` | 1.563 | 25.00 | Section headings |
| 3 | `--text-2xl` | 1.953 | 31.25 | Page headings |
| 4 | `--text-3xl` | 2.441 | 39.06 | Hero subheadings |
| 5 | `--text-4xl` | 3.052 | 48.83 | Hero headlines |
| 6 | `--text-5xl` | 3.815 | 61.04 | Display text |

---

## Responsive Typography with clamp()

```css
/* Fluid sizing that scales between breakpoints */
h1 { font-size: clamp(1.953rem, 1.5rem + 2vw, 3.052rem); }
h2 { font-size: clamp(1.563rem, 1.2rem + 1.5vw, 2.441rem); }
h3 { font-size: clamp(1.25rem, 1rem + 1vw, 1.953rem); }
h4 { font-size: clamp(1.125rem, 1rem + 0.5vw, 1.25rem); }
body { font-size: clamp(0.875rem, 0.8rem + 0.25vw, 1rem); }
```

**Formula**: `clamp(min, preferred, max)`
- min: mobile size
- preferred: `base + viewport-relative growth`
- max: desktop size

---

## Font Pairing Matrix

| Context | Display Font | Body Font | Mono Font | Load Strategy |
|:---|:---|:---|:---|:---|
| **Dashboard/CMS** | Geist | Geist | Geist Mono | `font-display: swap` |
| **Portfolio/Creative** | Outfit | Plus Jakarta Sans | Fira Code | `font-display: swap` |
| **SaaS Landing** | Cabinet Grotesk | Satoshi | JetBrains Mono | `font-display: optional` |
| **Documentation** | Plus Jakarta Sans | Inter | JetBrains Mono | `font-display: swap` |

### Loading Strategy

```html
<!-- Preload critical fonts (above-the-fold text) -->
<link rel="preload" href="/fonts/geist-variable.woff2" as="font" type="font/woff2" crossorigin>

<!-- Use font-display: swap to prevent FOIT -->
<style>
@font-face {
  font-family: 'Geist';
  src: url('/fonts/geist-variable.woff2') format('woff2');
  font-display: swap;
  font-weight: 100 900;
}
</style>
```

---

## Line Height & Spacing

| Text Type | Line Height | Letter Spacing | Max Width |
|:---|:---|:---|:---|
| Display (h1-h2) | 1.1 | -0.02em (tracking tight) | 20ch |
| Heading (h3-h4) | 1.2 | -0.01em | 30ch |
| Body | 1.6 | 0 (normal) | 65ch |
| Caption/Meta | 1.4 | 0.01em | 45ch |
| Overline/Label | 1.0 | 0.05em (wide) | 20ch |
| Mono/Code | 1.5 | 0 | 80ch |

---

## Banned Fonts

| Font | Why |
|:---|:---|
| Inter | Overused, default-looking, carries no personality |
| System UI / -apple-system | Acceptable fallback, never primary |
| Times New Roman | Dated, unprofessional in digital |
| Georgia | Same as above |
| Arial | Generic, no character |
| Comic Sans | Self-explanatory |

### Exception
Inter is acceptable ONLY in documentation or utility contexts where personality is explicitly unwanted.
