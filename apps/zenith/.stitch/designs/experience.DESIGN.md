# Design System: Portfolio Experience Section (Professional Milestones)
**Project ID:** 6063674963019114840

## 1. Visual Theme & Atmosphere
The Experience Section introduces **Chronological Orchestration**. It is a high-density, kinetic environment for managing professional history. The core visual metaphor is the "Milestone Card"—a modular block that can be reordered, expanded for enrichment, or collapsed for oversight.

## 2. Color Palette & Roles
| Descriptive Name | Hex Code | Functional Role |
| :--- | :--- | :--- |
| **Oceanic Obsidian (Base)** | `#0b1326` | Main background. |
| **Muted Onyx (Surface)** | `#171f33` | Background for the main sortable list container. |
| **High-Contrast Onyx** | `#2d3449` | Background for collapsed Milestone Cards. |
| **Brand Violet** | `#8B5CF6` | Primary action buttons and reordering handles. |

## 3. Typography Rules
- **Milestone Headers**: Manrope Bold for "Role" and "Institution" to emphasize career progression.
- **Supportive Metadata**: Inter Medium for "Company" and "Dates", using 40% opacity to maintain focus on the core roles.

## 4. Component Stylings
- **Milestone Cards**: Tonal blocks with generous rounded corners (rounded-3xl). On hover, a subtle Violet Lavender glow appears.
- **Kinetic Handles**: A vertical strip of 6-dot icons (Lucide `GripVertical`) positioned on the far left.
- **Expandable Logic**: Cards transition from high-density previews to rich-text editors for "Responsibilities".

## 5. Layout Principles (Desktop)
- **Fluid Vertical Stack**: Cards are stacked with `gap-4` to create a cohesive timeline feel.
- **Instrument Density**: High-density inputs (h-10) are used within the expanded cards to keep the UI instrument-like.
- **Visual Staging**: Use the "No-Line" rule to define card boundaries through background shifts against the obsidian base.
