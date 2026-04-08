# Design System: Portfolio Home Section (The Identity Baseline)
**Project ID:** 6063674963019114840

## 1. Visual Theme & Atmosphere
The Home Section editor follows the **Nocturnal Executive** atmosphere: a high-density, authoritative editorial environment. It focuses on the "Identity Baseline"—the core punchline of the portfolio. The UI is meticulously layered using tonal depth rather than borders.

## 2. Color Palette & Roles
| Descriptive Name | Hex Code | Functional Role |
| :--- | :--- | :--- |
| **Oceanic Obsidian (Base)** | `#0b1326` | Background layer. |
| **Muted Onyx (Surface)** | `#171f33` | Card backgrounds (`surface-container-low`). |
| **High-Contrast Onyx** | `#2d3449` | Active input states and nested containers. |
| **Brand Violet** | `#8B5CF6` | Primary buttons and status indicators. |
| **Violet Lavender** | `#d0bcff` | Accents and active navigation. |

## 3. Typography Rules
- **Display Header**: Manrope Bold for "Home Section" title and chapter headlines.
- **UI Labels**: Inter Medium for form labels and instructional text.
- **Letter Spacing**: Tight tracking on display headers for an executive feel.

## 4. Component Stylings
- **The "No-Line" Rule**: Borders are prohibited. Boundaries are defined by shifting from `#0b1326` (Base) to `#171f33` (Surface).
- **Identity Cards**: Generous padding (p-8). Use `surface-container-low/20` for a professional, understated look.
- **Asset Uploader**: A sophisticated, tonal drop-zone for the CV and a circular preview surface for the Profile Picture.
- **Inputs**: Transparent backgrounds with subtle `#2d3449` underlines or tonal card housing.

## 5. Layout Principles (Desktop)
- **Grid Strategy**: 2-column asymmetric split for metadata vs. assets.
- **Whitespace**: Precise, instrument-like spacing (gap-8) to avoid clutter in a high-density workspace.
- **Footer**: Integrated "Maturity Strip" using a solid Violet progress bar.
