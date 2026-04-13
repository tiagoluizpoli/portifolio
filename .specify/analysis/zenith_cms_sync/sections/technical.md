[← Back to Report](../report.md)

# Technical Reqs & Branding Discrepancies

This section covers global constraints and technical standardizations.

## Findings

### 1. Branding Naming Convention
- **Requirement**: "Naming Convention: All UI references must use 'Portfolio CMS'."
- **Current implementation**: 
  - Most headers use "Home", "Experience", etc., or "Hero Identity".
  - The prefix "Portfolio CMS" is absent from the visual viewport.
- **Impact**: Weakens the project identity. The user requested this as a global constraint.

### 2. Form Management (§XVII Bypass)
- **Requirement**: "Use the established §XVII bypass pattern only when recursion depth limits are hit."
- **Current implementation**: 
  - Many files contain `// biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass`.
  - However, the proper "bypass pattern" usually involves more structured aliasing or typed-bypassing according to the Constitution.
- **Impact**: Code quality maintenance.

### 3. Spacing (Aesthetic Balance)
- **Requirement**: "Enforce a strict 'Aesthetic Balance' rule: consistent paddings, compact layouts."
- **Current implementation**: 
  - Paddings vary (e.g. `p-4` vs `p-6` in cards in the same section).
- **Impact**: Breaks the "premium feel" requested.

## Correction Required
- [ ] Implement a unified `CmsPageHeader` component that prepends "Portfolio CMS /".
- [ ] Normalize paddings across all `Card` containers in `sections/`.
- [ ] Review the §XVII bypass usage to ensure consistency.
