# Design System: Oceanic Obsidian (The Nocturnal Executive)
**Project ID:** 16260971213408147494

## 1. Visual Theme & Atmosphere
The "Oceanic Obsidian" design system (internally known as **The Nocturnal Executive**) rejects the "flat dashboard" trope in favor of an editorial, high-density environment that feels like a precision instrument. The creative north star is **The Digital Curator**: a philosophy where information is staged for executive consumption.

- **Mood**: Authoritative, professional, high-density, and meticulously layered.
- **Atmosphere**: Deep, immersive dark mode with a focus on tonal depth rather than traditional borders.

## 2. Color Palette & Roles
The palette is rooted in deep obsidian tones with sophisticated violet accents.

| Descriptive Name | Hex Code | Functional Role |
| :--- | :--- | :--- |
| **Oceanic Obsidian (Base)** | `#0b1326` | Main application background (Base Layer). |
| **Muted Onyx (Surface)** | `#171f33` | Primary layout blocks and component background. |
| **High-Contrast Onyx** | `#2d3449` | Nested containers and active card states. |
| **Brand Violet** | `#8B5CF6` | Primary action color, status indicators, and subtle accents. |
| **Violet Lavender** | `#d0bcff` | Primary text accents and active navigation/toggles. |
| **Executive Gold** | `#ffb869` | Tertiary alerts and non-critical status indicators. |

## 3. Typography Rules
A dual-font system balancing high-density data with executive elegance.

- **Headers & Display**: **Manrope** (Geometric Sans). 
    - Used for metrics (`display-lg`) and welcome headers. 
    - *Philosophy*: Bold, authoritative, and geometric.
- **UI & Body**: **Inter** (Semantic Sans).
    - Used for UI labels, lists, and data points.
    - *Philosophy*: Optimized for readability in high-density contexts.

## 4. Component Stylings
- **The "No-Line" Rule**: Borders are prohibited. Boundaries must be defined through background shifts (e.g., `surface` vs `surface-container`).
- **Cards**: Minimalist, flat containers using `surface-container` background. On hover, they shift to `surface-container-high` to create "light-based" rather than "motion-based" depth.
- **Buttons**: Primary buttons use a linear gradient from `#d0bcff` to `#a078ff`.
- **Navigation**: Uses low-contrast muted foreground text for inactive items and vibrant Lavender/Violet for active states. WIP items are deactivated with 40% opacity.

## 5. Layout Principles
- **High-Density Grid**: Asymmetrical splits (e.g., 70/30) to feel bespoke.
- **Margins & Spacing**: Tight, cohesive spacing (`spacing-4` to `spacing-6`) to maintain an "instrument-like" feel.
- **Flag Icons**: Strictly minimalist, rectangular, and flat. No waving effects or realistic textures.

---
*This document serves as the prompt source of truth for all Zenith Hub design and code iterations.*
