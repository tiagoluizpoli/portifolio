# Feature Specification: Zenith Setup

**Feature Branch**: `003-zenith-setup`  
**Created**: 2026-03-20  
**Status**: Draft  
**Input**: "setup the tanstackStart project with everything it needs to run... newest stuff... no deprecated craps... nothing regarding the project itself... just setup stuff."

## Clarifications

### Session 2026-03-20
- **Startup Validation**: If core environment variables are missing, the system MUST display a user-friendly error page listing the missing variables rather than crashing to the terminal.
- **Startup Error Details**: The startup error page MUST list all missing/invalid keys and include a link to the `.env.example` or setup documentation.
- **Hydration Safety**: The system MUST provide a global `<ClientOnly />` component wrapper based on the `useHydrated()` hook to safely isolate client-side logic.
- **Startup Validation Scope**: Fail-fast validation MUST focus on the presence and format of required environment variables; active connectivity pings to external services (AppWrite) should be deferred to a later stage or handled via data-fetching error boundaries.
- **Domain Model Validation**: All domain models in `@repo/appwrite-core` MUST be defined using Zod schemas to serve as the single source of truth for both TypeScript types and runtime validation.
- **Theme Tokens**: The system MUST use OKLCH-based CSS variables for the theme palette, following the Tailwind v4 standard for superior color interpolation and maintenance.
- **Domain Abstraction**: Shared models in `@repo/appwrite-core` MUST be defined as decoupled domain-layer interfaces. The Repository implementation is responsible for mapping AppWrite-specific document structures to these clean domain entities.
- **Transaction Orchestration (FR-015)**: Multi-step rollback logic MUST use a centralized `TransactionManager` in `@repo/appwrite-core` to track and undo operations rather than manual try/catch blocks in every service.

- **Compensating Transactions (FR-015) Strategy**: Use a centralized `TransactionManager` to orchestrate rollbacks.
- **Startup Error Page (FR-011) Implementation**: MUST be implemented as a high-reliability static HTML or minimal zero-dependency JS file to ensure visibility during catastrophic initialization failures.
- **Runtime Telemetry (FR-013) Format**: Logs emitted to `stdout/stderr` MUST follow a structured JSON format (level, timestamp, message, context) to facilitate automated parsing and observability.

### XII. Mandatory Quality Gating for Completion
No task or feature implementation is considered "Done" until the following checks pass with zero errors in the affected workspaces, using the scripts defined in their `package.json`:
1. **Linting & Formatting**: `pnpm biome check .` (or `pnpm lint`)
2. **Type Safety**: `pnpm typecheck`
3. **Automated Testing**: All relevant unit and integration tests pass (`pnpm test`).
This gate is mandatory and MUST be verified before notifying the user of completion.

### XIII. AppWrite 2026 Standards
All AppWrite-related infrastructure, data operations, and migrations MUST strictly adhere to the standards defined in `.specify/memory/appwrite_guidelines_2026.md`. This includes the exclusive use of the `TablesDB` client, transactional integrity, and mandatory polling for asynchronous attribute creation.

## Governance
- The Roadmap and Constitution supersede all individual implementation decisions.
- Changes to the Roadmap or Constitution require explicit documentation and rationale.

**Version**: 1.6.0 | **Ratified**: 2026-03-19 | **Last Amended**: 2026-03-21

## Clarifications

### Session 2026-03-20
- **Observability Strategy**: System and server function logs MUST use standard `console.log/error` to Docker `stdout/stderr`. Persistent 3rd party APM integration is explicitly deferred.
- **Performance Baseline**: The application MUST achieve a "Time to Interactive" (TTI) of < 2.5 seconds on a standard 4G/Desktop connection.
- **Script Standardization**: The project MUST provide root-level `pnpm` prefixed scripts (`zenith:dev`, `zenith:build`, `zenith:typecheck`) to manage the application without manual directory switching.
- **Typography Standards**: Typography choice is flexible per application. Zenith uses **Geist** (Sans/Mono), but other workspace apps (e.g., Portfolio) are NOT mandated to use it.
- **Build-time Validation**: Environment variable validation (FR-011) MUST support a `SKIP_ENV_VALIDATION` override (or equivalent logic) to allow successful `vinxi build` execution in CI/CD environments where real AppWrite keys are absent.
### Session 2026-03-22
- **User Role Implementation Strategy**: System MUST implement a single, generic admin shell for the initial setup. Multi-role navigation logic is deferred.
- **Loading State Architecture**: System MUST implement a global Top-of-Page loading bar (e.g., `nprogress`) for all navigation. Discrete skeletons are deferred.
- **Conflict Resolution Strategy**: System MUST use a **Blocking Error Overlay** during the rollback process to prevent user interaction until the state is consistent.
- **Data Resilience & Failure Modes**: System MUST redirect to a **"Connection Lost" Error Page** after **3 consecutive failed server function attempts** or a **timeout > 10s**. 
- **Automatic Form Persistence**: The mechanism MUST trigger on any `AppWriteException` where connectivity is lost (code: 0). Backups MUST use the `zenith:form-backup:*` namespace in `localStorage` and be purged after **24 hours** or successful submission.
- **Blocking Error Overlay**: Behavior MUST include a non-dismissible modal and **pointer-lock/touch-prevention** to ensure zero state mutation during rollbacks.
- **Zero-Flash Timing**: Theme initialization MUST complete within **< 50ms** before the first contentful paint (FCP).
- **Orchestrator Limits**: Routes in `src/routes/` MUST be lightweight, with a **soft limit of 100 LoC** and zero local business logic (must be delegated to `features/`).
- **Q: Data Resilience & Failure Modes → A: Redirect to "Connection Lost" Page with automatic form persistence.**
- **Theme Persistence Strategy**: System MUST implement a formal `ThemeProvider` (React Context) that EXACTLY replicates the initialization logic of the `THEME_INIT_SCRIPT` from `clean-tanstack-proj`. Once validated, the core initialization logic within the provider MUST be wrapped in a "FIXED LOGIC - DO NOT MODIFY" comment block to prevent regression while allowing for feature expansion.
- **Q: Theme Persistence Strategy → A: ThemeProvider / Context with immutable logic protection.**

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Type-Safe Full-Stack Foundation (Priority: P1)

As a developer, I want a fully initialized TanStack Start project so that I can immediately start building features with end-to-end type safety and modern server-side capabilities.

**Why this priority**: High. This is the bedrock of the admin hub.

**Independent Test**: Can be tested by running `pnpm dev` in the `apps/zenith` directory and verifying the TanStack Start dashboard/welcome screen loads without errors.

**Acceptance Scenarios**:

1. **Given** a clean `apps/zenith` directory, **When** `pnpm dev` is executed, **Then** the TanStack Start development server starts successfully.
2. **Given** the application is running, **When** I access the root route, **Then** I see the default TanStack Start boilerplate with working SSR.

---

### User Story 2 - Modern Styling Foundation (Priority: P2)

As a developer, I want Shadcn UI integrated with Tailwind CSS v4 so that I can build a premium, visually stunning interface using the latest styling engine and modern components.

**Why this priority**: Medium. Essential for the "wow" factor and development speed.

**Independent Test**: Can be tested by adding a Shadcn UI component (e.g., Button) and verifying it renders correctly with Tailwind v4 styles (including theme variables from CSS-first config).

**Acceptance Scenarios**:

1. **Given** Tailwind v4 is configured, **When** I use a `@theme` variable in CSS, **Then** it is correctly applied to components.
2. **Given** a Shadcn component is initialized, **When** it is rendered, **Then** it uses React 19 style `ref` passing (no `forwardRef` errors).

---

### User Story 3 - Secure Server Environment (Priority: P1)

As an architect, I want a secure environment for handling AppWrite secrets so that API keys are never leaked to the client-side bundle.

**Why this priority**: High. Security is non-negotiable.

**Independent Test**: Can be tested by implementing a dummy `createServerFn` that accesses a `.env` variable and verifying that searching the client-side JavaScript bundle for that variable returns zero results.

**Acceptance Scenarios**:

1. **Given** a `.env` file with `APPWRITE_API_KEY`, **When** I use `createServerFn`, **Then** the key is accessible on the server.
2. **Given** the same environment, **When** I look at the client-side source, **Then** the secret key is NOT present.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use **TanStack Start v1** (RC/Stable) as the core framework.
- **FR-002**: System MUST use **React 19** (Stable) and adhere to its modern prop-passing patterns (e.g., direct `ref` passing, `useActionState` for forms).
- **FR-003**: System MUST use **Tailwind CSS v4** with a CSS-first configuration (no `tailwind.config.js`). Theme extensions MUST reside in `src/index.css` using **OKLCH-based CSS variables** for all tokens.
- **FR-003.1**: Zenith MUST use **Geist Sans** for UI and **Geist Mono** for data/code displays, integrated directly into the Tailwind v4 @theme.
- **FR-004**: System MUST configure **Shadcn UI** using `#/*` aliases in `components.json`, pointing `tailwind.css` to `src/styles.css` and explicitly excluding `tailwind.config.js`.
- **FR-005**: System MUST implement a `src/infrastructure/appwrite` module that uses `createServerFn({ method: 'POST'|'GET' })` with Zod validation for all privileged operations.
- **FR-006**: System MUST follow a **Bulletproof-inspired feature-based structure**, adapted for TanStack Start:
    - `src/features/{feature}/`: Each feature (e.g., `auth`, `profile`) MUST encapsulate its own `api/`, `components/`, `hooks/`, and `types/`.
    - `src/routes/`: Routes SHOULD act as lightweight orchestrators, importing components and logic from the `features/` directory.
    - `src/components/`: Reserved for global, shared UI components (e.g., Shadcn base components).
    - `src/hooks/`, `src/lib/`, `src/utils/`: Reserved for truly global cross-cutting concerns.
    - **Single Config**: MUST use `vite.config.ts` only (no `app.config.ts`).
    - **Vite Plugins**: Nitro (nightly), TsconfigPaths, TailwindCSS v4, TanStackStart, ViteReact.
    - **Styles**: `src/styles.css` is the source of truth, imported in `__root.tsx` via `?url`.
    - **Visual Parity**: Implementation MUST achieve **identical OKLCH variable mapping** to Stitch designs as the baseline for semantic fidelity.
- **FR-007**: System MUST provide a `.env.example` defining `VITE_` prefixed public variables and secure non-prefixed secret variables (API Keys).
- **FR-008**: System MUST integrate with the root **Biome** configuration, ensuring NO ESLint or Prettier files exist in the application folder.
- **FR-009**: System MUST centralize ALL AppWrite CRUD operations and Domain Models in the shared `@repo/appwrite-core` package. Domain Models MUST be defined using Zod schemas as the source of truth for both types and runtime validation, decoupled from the AppWrite SDK using the Repository Pattern.
- **FR-010**: System MUST implement a standardized exception mapping system in `@repo/appwrite-core` to handle permissions and errors gracefully.
- **FR-011**: System MUST perform **Fail-Fast Startup Validation** for mandatory environment variables (presence and format check only). If validation fails at runtime, the app MUST render a specialized **TanStack Error Component** displaying the missing/invalid keys with links to documentation. Validation MUST be skippable during the build phase via a `SKIP_ENV_VALIDATION` flag.
- **FR-012**: System MUST use the `useHydrated()` pattern and provide a global `<ClientOnly />` component to prevent SSR hydration mismatches, explicitly leveraging TanStack Start's hydration utilities for server-to-client state transfer.
- **FR-013**: System MUST emit all telemetry and runtime logs to the standard `stdout/stderr` streams in a **structured JSON format** for efficient Docker log collection and observability.
- **FR-014**: Root-level `package.json` MUST expose `zenith:` prefixed scripts for all common lifecycle tasks.
- **FR-015**: System MUST implement **Compensating Transactions** in the application service layer via a centralized `TransactionManager` in `@repo/appwrite-core`. 
    - **FR-015.1**: Support for **asynchronous compensating actions** (e.g., polling for resource deletion) MUST be built-in.
    - **FR-015.2**: If a compensating action fails, the system MUST emit a CRITICAL log with the full state for manual intervention.
- **FR-016**: System MUST leverage **Google Stitch** specialized skills for all UI design. 
    - **FR-016.1**: Every Stitch-generated design MUST be validated against the implementation for semantic alignment and visual fidelity before completion.

### Key Entities

- **Zenith App**: The TanStack Start application instance.
- **Shared Repository**: Centralized logic in `@repo/appwrite-core` for all AppWrite interactions.
- **Domain Exceptions**: Specialized error objects (e.g., `PermissionDeniedException`) for graceful degradation.
- **Server Functions**: Type-safe RPCs for secure AppWrite communication.
- **Theme Tokens**: OKLCH-based color variables defined in CSS.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero linting errors via `pnpm lint` (Biome).
- **SC-002**: Zero TypeScript errors via `pnpm typecheck`.
- **SC-003**: Lighthouse Performance score > 90 and TTI < 2.5s for the default dashboard on 4G/Desktop.
- **SC-004**: Successful extraction of secret variables from server-only context confirmed by code audit.
