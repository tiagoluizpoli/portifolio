# Design System: Portfolio Skills Section (Visual Arsenal)
**Project ID:** 6063674963019114840

## 1. Visual Theme & Atmosphere
The Skills Section focuses on **Visual Curation**. It uses a high-density categorical grid to stage the user's technical and professional arsenal. The vibe is "Curator's Studio": organized, visual, and highly interactive.

## 2. Color Palette & Roles
| Descriptive Name | Hex Code | Functional Role |
| :--- | :--- | :--- |
| **Oceanic Obsidian (Base)** | `#0b1326` | Background layer. |
| **Muted Onyx (Surface)** | `#171f33` | Background for the categorical tab rail. |
| **High-Contrast Onyx** | `#2d3449` | Background for individual Skill Cards (`bg-surface-container-low/20`). |
| **Active Violet** | `#8B5CF6` | Selection highlights and icon accents. |

## 3. Typography Rules
- **Category Tabs**: Inter ExtraBold (text-[10px]) with high letter-spacing (0.2em) for an authoritative executive feel.
- **Skill Labels**: Inter SemiBold (text-sm) for clear, readable skill names.

## 4. Component Stylings
- **Skill Cards**: Small, tonal squares or rectangles with `rounded-2xl`. On hover, they shift to a primary violet tint.
- **Icon Rendering**: Icons from the `logos` or `devicon` sets are rendered with high contrast against the dark surfaces.
- **Category Tabs**: Pill-shaped or underlined indicators using `#8B5CF6`.

## 5. Layout Principles (Desktop)
- **Categorical Grid**: Skills are grouped into cards within a responsive grid (`grid-cols-2 md:grid-cols-4 lg:grid-cols-6`).
- **Tabbed Navigation**: A horizontal rail at the top to filter between "Hard Skills," "Soft Skills," and "Tools."
- **Instrument Density**: Tight gaps (`gap-4`) to maintain a "dashboard instrument" appearance.
