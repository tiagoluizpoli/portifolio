# Research: Zenith UI Design & StitchMCP

## Decision: Shadcn-First Administrative Design
**Rationale**: The user explicitly requested a "Shadcn First" approach for visual excellence and robust component usage. Shadcn provides the premium, clean, and direct aesthetic required for a management hub.

## Decision: StitchMCP Generation Strategy
**Rationale**: To optimize token usage and ensure robustness, prompts will be detailed, specifying exact Shadcn components, layout density, and the "Premium Admin" aesthetic. Screens will be generated in logical phases (Layout -> Dashboard -> Administrative Tools).

## Decision: High-Density Layout Benchmarks
**Rationale**: To ensure "Intelligent Space Usage" (Spec §FR-003), the UI will follow high-density spacing rules:
- **Max Padding**: Containers should not exceed `p-6` (24px).
- **Default Gap**: Grids and flex layouts should use `gap-4` (16px) or `gap-2` (8px) for related elements.
- **Compact Components**: Use "small" or "compact" variants of Shadcn components where available.

## Alternatives Considered: Custom Tailwind Components
**Rejected Because**: Violates the "SHADCN FIRST" core constraint. Custom components are more prone to inconsistent design language compared to a unified UI library.

## StitchMCP Prompt Templates

### Layout Template (Main Shell)
"Premium admin dashboard layout for Zenith Hub. Sidebar navigation (Dashboard, Users, Portfolio, Settings, Logs). Topbar with Breadcrumbs, Search, User Profile. Shadcn UI exclusively. Dark mode, Brand Violet accents. High-density but clean."

### Dashboard Template
"Data-dense admin dashboard for Zenith. KPI Card grid (4 columns). Recent activity list (ScrollArea). System health (Badges/Progress). Shadcn typography. Premium executive feel."
