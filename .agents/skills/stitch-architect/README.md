# Stitch Architect Skill

Unified entry point for Google Stitch design work. Handles prompt enhancement, design system synthesis, and high-fidelity screen generation with scope safety.

## What This Skill Does

- Translates `DESIGN.md` tokens into Stitch-optimized prompts
- Generates screens via Stitch MCP with precise style matching
- Enforces **UI Red Flag Protocol** to prevent scope creep during edits
- Applies design systems consistently across all project screens

## Workflow

1. Read `DESIGN.md` (from design-curator)
2. Enhance user prompt with color, typography, spacing context
3. Generate or edit screens via Stitch MCP
4. Verify output matches approved design tokens
5. Log any out-of-scope changes (triggers user approval)

## Safety

- Every edit requires explicit scope definition
- Protected elements (colors, layout, typography) cannot be changed without user approval
- UI Red Flag Protocol is MANDATORY for all screen edits
