# Research: Zenith UI Design & StitchMCP

## Decision: Shadcn-First Administrative Design
**Rationale**: The user explicitly requested a "Shadcn First" approach for visual excellence and robust component usage. Shadcn provides the premium, clean, and direct aesthetic required for a management hub.

## Decision: StitchMCP Generation Strategy
**Rationale**: To optimize token usage and ensure robustness, prompts will be detailed, specifying exact Shadcn components, layout density, and the "Premium Admin" aesthetic. Screens will be generated in logical phases (Layout -> Dashboard -> Administrative Tools).

## Decision: Visitor Analytics Storage
**Rationale**: For personal visitor tracking (Visitors, Time, Geo), we will use an `analytics` collection in Appwrite TablesDB.
- **Fields**: `sessionId`, `timestamp`, `path`, `duration`, `country`, `state`.
- **Integration**: Tracked via a global `useEffect` or TanStack Router hook in the portfolio app, pushed directly to the `analytics` collection.
- **Privacy**: No PII collected. Strictly for aggregate dashboard display.

## Decision: High-Density Layout Benchmarks
**Rationale**: To ensure "Intelligent Space Usage" (Spec §FR-003), the UI will follow high-density spacing rules:
- **Max Padding**: Containers should use `p-4` (16px) or `p-2` (8px). Avoid `p-6` unless necessary for hero sections.
- **Default Gap**: Grids and flex layouts should use `gap-2` (8px). Use `gap-1` (4px) for micro-components.
- **Symmetry**: Elements in the same row must be `h-full` or `items-stretch` to ensure visual alignment.
- **Roundness**: Prefer `rounded-md` (0.375rem).
- **Typography**: MUST use **Geist Sans** and **Geist Mono** for the premium, intelligence-oriented administrative hub aesthetic.

## Decision: Visual Parity & Stitch Audit
**Rationale**: To maintain the highest level of semantic and visual fidelity, every implemented component must be audited against the **Google Stitch** designs for OKLCH variable mapping (Audit CHK024).

## Alternatives Considered: Custom Tailwind Components
**Rejected Because**: Violates the "SHADCN FIRST" core constraint. Custom components are more prone to inconsistent design language compared to a unified UI library.

## StitchMCP Prompt Templates

### Layout Template (Main Shell)
"Premium admin dashboard layout for Zenith Hub. Sidebar navigation (Dashboard, Users, Portfolio, Settings, Logs). Topbar with Breadcrumbs, Search, User Profile. Shadcn UI exclusively. Dark mode, Brand Violet accents. High-density but clean."

### Dashboard Template
"Data-dense admin dashboard for Zenith. KPI Card grid (4 columns). Recent activity list (ScrollArea). System health (Badges/Progress). Shadcn typography. Premium executive feel."
