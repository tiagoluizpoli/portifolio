# Color System — HSL Calibration Guide

## The Science of Color in UI

Color in UI is not aesthetic preference — it's engineering. Every color must serve a functional purpose, maintain accessibility, and harmonize with its neighbors.

---

## HSL Formula Reference

HSL = Hue (0-360°), Saturation (0-100%), Lightness (0-100%)

### Why HSL Over Hex?

- **Hex**: `#3B82F6` — opaque, no intuition about relationships
- **HSL**: `217 91% 60%` — immediately tells you: blue (217°), vivid (91%), medium (60%)
- **HSL makes dark mode trivial**: Keep H and S, invert L

---

## Semantic Token Architecture

### Light Mode
```css
:root {
  --background: 0 0% 98%;          /* Off-white canvas */
  --foreground: 240 5% 10%;        /* Near-black text */
  --card: 0 0% 100%;               /* Pure white cards */
  --card-foreground: 240 5% 10%;
  --primary: 217 72% 50%;          /* Brand blue — S < 80% */
  --primary-foreground: 0 0% 100%;
  --secondary: 240 5% 94%;         /* Muted surface */
  --secondary-foreground: 240 5% 30%;
  --muted: 240 5% 96%;             /* Background alt */
  --muted-foreground: 240 4% 46%;  /* Secondary text */
  --accent: 240 5% 94%;
  --accent-foreground: 240 5% 10%;
  --destructive: 0 84% 60%;        /* Warm red error */
  --destructive-foreground: 0 0% 100%;
  --border: 240 6% 90%;            /* Structural lines */
  --input: 240 6% 90%;             /* Input borders */
  --ring: 217 72% 50%;             /* Focus ring = primary */
}
```

### Dark Mode (Invert Lightness, Preserve Hue)
```css
.dark {
  --background: 240 5% 6%;         /* L: 98% → 6% */
  --foreground: 0 0% 95%;          /* L: 10% → 95% */
  --card: 240 5% 9%;               /* L: 100% → 9% */
  --card-foreground: 0 0% 95%;
  --primary: 217 72% 55%;          /* L: 50% → 55% (slightly brighter for dark bg) */
  --primary-foreground: 0 0% 100%;
  --secondary: 240 4% 16%;         /* L: 94% → 16% */
  --secondary-foreground: 240 5% 75%;
  --muted: 240 4% 14%;             /* L: 96% → 14% */
  --muted-foreground: 240 5% 55%;
  --destructive: 0 72% 51%;
  --border: 240 4% 18%;            /* L: 90% → 18% */
  --input: 240 4% 18%;
  --ring: 217 72% 55%;
}
```

---

## Palette Generation Algorithm

### Step 1: Choose Brand Hue
Pick a single hue (0-360) for your brand. Examples:
- Blue: 217 | Teal: 175 | Green: 142 | Orange: 25 | Purple: 262

### Step 2: Generate Neutral Scale
Keep the hue, set S to 5%, vary L:

```
50:  H 5% 98%    ← lightest (almost white)
100: H 5% 96%
200: H 5% 90%
300: H 5% 82%
400: H 5% 64%
500: H 5% 46%    ← middle gray
600: H 5% 33%
700: H 5% 25%
800: H 5% 15%
900: H 5% 10%
950: H 5% 4%     ← darkest (almost black)
```

### Step 3: Generate Primary Scale
Keep the hue, set S to 65-75%, vary L:

```
50:  H S% 95%
100: H S% 90%
200: H S% 80%
300: H S% 70%
400: H S% 60%
500: H S% 50%    ← default primary
600: H S% 42%
700: H S% 35%
800: H S% 25%
900: H S% 18%
950: H S% 10%
```

### Step 4: Accent (Optional)
One complementary accent. H offset = original H + 150-180°.
Max saturation: 80%.

---

## Banned Patterns

| Pattern | Why | Alternative |
|:---|:---|:---|
| Pure `#000000` | Too harsh, creates jarring contrast | Off-black `240 5% 4%` |
| Pure `#FFFFFF` | Causes eye strain on bright displays | Off-white `0 0% 98%` |
| S > 85% | Neon/radioactive appearance | Cap at 75% |
| Multiple accents | Visual noise, brand dilution | Single accent color |
| Warm + cool mixing | Palette dissonance | Pick one temperature |
| Purple/blue neon glow | AI-generated cliché | Subtle shadow tint |
