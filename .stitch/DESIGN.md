# Design System Specification: High-Density Editorial Portfolio (Oceanic Obsidian)

## 1. Overview & Creative North Star
The Creative North Star of this design system is **"The Digital Curator."** 

This is not a generic dashboard; it is a high-end, editorial experience designed for executive-level portfolio management. It rejects the "SaaS-standard" look of thin gray borders and flat white cards. Instead, it utilizes **Oceanic Obsidian** depths, **Brand Violet** energy, and **Glassmorphism** to create a UI that feels like a bespoke financial broadsheet. 

To break the "template" look, designers must embrace:
*   **Intentional Asymmetry:** Use the spacing scale to create rhythmic "white space" (negative space) that directs the eye to high-value metrics.
*   **Tonal Architecture:** Boundaries are defined by light, not lines. 
*   **Typographic Authority:** Massive, high-contrast headline scales paired with dense, functional utility text.

---

## 2. Colors & Surface Logic

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using `1px solid` borders for sectioning or containment. Traditional borders clutter the executive's view. 
*   **How to define boundaries:** Transition from `surface` (#0b1326) to `surface-container-low` (#131b2e) or `surface-container-high` (#222a3e). 
*   **Visual Soul:** Use the **Signature Gradient** (135° `primary` to `primary_container`) sparingly for high-action CTAs or to highlight \"North Star\" portfolio metrics.

### Surface Hierarchy & Nesting
Treat the interface as a physical stack of semi-translucent materials.
*   **Level 0 (Base):** `surface` (#0b1326).
*   **Level 1 (Sections):** `surface-container-low` (#131b2e) for large background areas.
*   **Level 2 (Active Cards):** `surface-container-high` (#222a3e) to pull critical data forward.
*   **Level 3 (Floating/Modals):** Use `surface_variant` with a 60% opacity and a `backdrop-blur: 12px`.

---

## 3. Typography
The system uses a \"Dual-Engine\" typographic approach to balance editorial elegance with data density.

| Role | Font Family | Character | Usage |
| :--- | :--- | :--- | :--- |
| **Display/Headline** | **Manrope** | Geometric, Authoritative | Portfolio totals, Section headers, Large metrics. |
| **Interface/Body** | **Inter** | Highly Legible, Functional | Labels, Data tables, Explanatory text, Small UI metadata. |

### Key Scales
*   **display-lg (3.5rem, Manrope):** For the primary portfolio value.
*   **headline-sm (1.5rem, Manrope):** For card titles.
*   **label-md (0.75rem, Inter):** For micro-data, using `on_surface_variant` for subtle hierarchy.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved by \"stacking\" tonal tiers. To lift a component, do not add a shadow; change its container token. For example, a `surface_container_highest` element sitting on a `surface_container_low` background creates a natural, soft lift.

### Ambient Shadows
If a floating element (like a dropdown) requires a shadow for legibility:
*   **Blur:** 24px - 40px.
*   **Opacity:** 4%-8%.
*   **Color:** Use a tinted version of `on_surface` (deep indigo-blue) rather than pure black.

### The \"Ghost Border\" Fallback
If accessibility testing requires a hard boundary, use the **Ghost Border**: 
*   Token: `outline_variant` (#494454).
*   Opacity: **Strictly 10-20%**. It should be felt, not seen.

---

## 5. Components

### Primary Buttons
*   **Style:** Signature Gradient (135° `primary` to `primary_container`).
*   **Typography:** `title-sm` (Inter), Semi-bold.
*   **Corner:** `rounded-md` (0.75rem).
*   **Interaction:** On hover, increase the `surface_tint` overlay.

### Executive Cards
*   **Background:** `surface_container_low` (#131b2e).
*   **Padding:** Use `spacing-5` (1.1rem) for a compact, high-density editorial feel.
*   **Dividers:** **FORBIDDEN.** Separate content blocks using `spacing-3` (0.6rem) vertical gaps or a subtle shift to `surface_container_high`.

### Data Chips
*   **Background:** Glassmorphic (`surface_variant` at 40% + blur).
*   **Border:** Ghost Border (15% opacity).
*   **Typography:** `label-sm` (Inter, All-caps, tracked out +5%).

### Input Fields
*   **Resting State:** `surface_container_highest` background, no border.
*   **Active State:** `primary` (#d0bcff) \"Ghost Border\" at 40% opacity.
*   **Error State:** Background shifts slightly toward `error_container`.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use `Manrope` for any number larger than 24px. It conveys financial authority.
*   **Do** use `surface-container-lowest` for \"well\" effects (e.g., a depressed area where secondary logs sit).
*   **Do** prioritize the 135° gradient for the single most important action on the screen.

### Don’t:
*   **Don’t** use white or light-gray text. Use `on_surface` (#dbe2fd) for primary text and `on_surface_variant` (#cbc3d7) for secondary.
*   **Don’t** use standard 1px borders to separate list items. Use vertical white space (from the Spacing Scale) or subtle background shifts.
*   **Don’t** use `rounded-none`. Everything must have at least `rounded-md` to maintain the premium, \"curated\" feel.
