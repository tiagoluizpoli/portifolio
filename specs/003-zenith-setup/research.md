# Research: Zenith Setup (Feature 003)

## Deciding: TanStack Start v1 (RC) Hydration Pattern
- **Decision**: Use `useHydrated()` for client-side gating and `StartClient` for root hydration.
- **Rationale**: Minimal flash, compatible with React 19 SSR.
- **Alternatives**: Standard `useEffect` (too slow/flashy).

## Deciding: Tailwind v4 Theme Variables
- **Decision**: Use OKLCH-based CSS variables in `src/styles.css`.
- **Rationale**: Consistent with Stitch Design System; superior color interpolation in CSS-first mode.
- **Alternatives**: Tailwind `hex` tokens (lacks P3/OKLCH gamut advantage).

## Deciding: Resilience Storage Strategy
- **Decision**: `localStorage` with `zenith:form-backup:*` namespace + 24h expiration.
- **Rationale**: Isolated from other apps in the domain; manageable expiration without complex eviction logic.
- **Alternatives**: IndexedDB (overkill for simple form strings).

## Deciding: Directory Modularity
- **Decision**: Full **Bulletproof React** pattern in `src/features/`.
- **Rationale**: Scalable, isolates domain logic from orchestrator routes.
- **Alternatives**: Flat directory (collapses on large feature sets).
