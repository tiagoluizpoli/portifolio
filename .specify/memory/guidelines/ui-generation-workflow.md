# Guideline: Stepped UI Generation Workflow (Stitch UI)

This guideline defines the mandatory, high-fidelity orchestration logic for generating and implementing UI components in the Portfolio monorepo. It leverages the Google Stitch Synergy (Principle XVII) to ensure maximum design quality and consistency.

## Overview
The workflow is a 5-step iterative pipeline executed **per screen**. Implementation (React code) only begins after the visual design has been explicitly approved by the developer.

---

## The 5-Step Pipeline

### 1. Enhance Prompt (`enhance-prompt`)
**Goal**: Transform requirements/sketches into a professional UI/UX prompt.
- **Input**: User request or technical specification details.
- **Action**: Call the `enhance-prompt` skill to add design system context (Oceanic Obsidian), UI/UX keywords, and structural hierarchy.

### 2. High-Fidelity Generation (`stitch-design` / `stitch-loop`)
**Goal**: Generate the visual authoritative baseline.
- **Action**: Call `stitch-design` for single screens or `stitch-loop` for interactive sequences using the enhanced prompt.

### 3. Iterative User Approval (**CRITICAL**)
**Goal**: Ensure design alignment before coding.
- **Action**: Present the generated Stitch screenshots and HTML previews to the user.
- **Gate**: **DO NOT** proceed to implementation until the user provides explicit approval or requested modifications have been applied.

### 4. Design System Synthesis (`design-md`)
**Goal**: Document the "Source of Truth" for the specific screen.
- **Action**: Call `design-md` **per screen** to generate a dedicated `DESIGN.md` (or update a unified manifest) capturing color roles, typography, and geometry.

### 5. Multi-Track Implementation
**Goal**: Transform the approved design into production-ready assets.
- **Walking-Through**: Call `remotion` to generate a professional walkthrough video for interactive flows.
- **React Components**: Call `react:components` to generate modular, type-safe components.
- **UI Primitives**: Call `shadcn-ui` to integrate established project accessibility and component standards.

---

## Asset Naming & Organization
- **Screenshots**: `.stitch/designs/{screen-name}.png`
- **HTML Previews**: `.stitch/designs/{screen-name}.html`
- **Design Docs**: `.stitch/designs/{screen-name}.DESIGN.md`

## Key Rules
- **Design-First**: The Stitch design is the authoritative source for all Tailwind classes and component hierarchy.
- **Iterative Loop**: Use `edit_screens` within the Stitch workflow for refinements instead of full re-generation.
- **Zero-Line Borders**: Adhere strictly to the "No-Line" rule (Principle II of Oceanic Obsidian) by using tonal background shifts.
