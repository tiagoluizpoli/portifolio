# Phase 0: Outline & Research

## Decision: Setup Env Validation Interceptor
**Rationale**: FR-011 requires the system to intercept missing environment variables and display a static HTML error page instead of crashing Node.js causing 502s. By executing the validation in a Vite plugin or pure Node root script before `@tanstack/react-start/server` mounts, we can return early HTTP responses.
**Alternatives considered**: Route-level Error component. Rejected because a failed `import.meta.env` parsing at the module level crashes Node before the router tree can mount the error boundary.

## Decision: TransactionManager Orchestration
**Rationale**: FR-015 requires all multi-step AppWrite actions in `infrastructure/appwrite/server.ts` to be orchestrated via a central `TransactionManager`. This ensures compensation actions (rollbacks) are executed if a task fails.
**Alternatives considered**: Wrapping direct `PortfolioService` functions in try/catch. Rejected because it violates the constitution's mandate for a centralized architecture and LIFO rollback mechanisms.

## Decision: Feature Extraction for Dashboard
**Rationale**: FR-006 limits `routes/index.tsx` to < 100 LoC. The dashboard UI will be extracted into `features/dashboard/components/` (kpi-cards, access-chart, inquiry-list, geo-distribution).
**Alternatives considered**: Breaking into smaller files inside `routes/`. Rejected because the Constitution (Bulletproof-inspired structure) mandates delegating non-orchestration logic to `features/`.
