# Feature Specification: Refactoring Zenith Architecture

**Feature Branch**: `005-refactor-zenith-architecture`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Address Zenith architectural violations: FR-011 (startup validation), FR-015 (compensating transactions) and FR-006 (route bloat)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Resilient Startup Validation (Priority: P1)

As a system administrator, I want the application to safely intercept missing environment configurations during boot and present a static HTML diagnostic page instead of crashing the Node server, so that I can immediately identify missing required variables without digging into low-level proxy or system logs.

**Why this priority**: High. Node.js crashes lead to silent 502 proxy errors for end users, severely harming observability during deployments.

**Independent Test**: Can be fully tested by starting the Zenith development server with a blank `.env` file and verifying that the browser displays a formatted setup error page.

**Acceptance Scenarios**:

1. **Given** an environment with one or more missing required variables, **When** the server starts and receives a request, **Then** it serves the static HTML/minimal JS error diagnostic page detailing the exact missing keys.
2. **Given** a complete set of valid environment variables, **When** the server starts, **Then** TanStack Router initializes and renders the application normally.

---

### User Story 2 - Transactional Integrity & Rollbacks (Priority: P1)

As an application architect, I want all multi-step mutation operations (like creating a portfolio item and its metadata) to run inside a centralized Transaction Manager context, so that if a remote server function fails midway, all previous steps are automatically rolled back or compensated, preserving system integrity.

**Why this priority**: High. Data corruption from partial failures is difficult to detect and repair.

**Independent Test**: Can be fully tested by mocking an exception in step two of a server function operation and observing that the system logs and executes the compensation logic for step one.

**Acceptance Scenarios**:

1. **Given** a server function interacting with the AppWrite data layers, **When** an exception is thrown in the middle of a transaction block, **Then** the Transaction Manager executes the registered compensating actions (rollbacks) for all completed steps.

---

### User Story 3 - Scalable Route Orchestrators (Priority: P2)

As a frontend developer, I want the Zenith dashboard route (`routes/index.tsx`) to act strictly as a routing orchestrator rather than a monolithic UI container, so that I can easily comprehend data flow and swap out UI modules without sifting through hundreds of lines of presentation markup.

**Why this priority**: Medium-High. Maintains the "Bulletproof" architecture standard and ensures future feature scaling doesn't pollute the routing tree.

**Independent Test**: Can be fully tested by verifying through static analysis that the `routes/index.tsx` file is under 100 Lines of Code and that all dashboard content renders identically to the user.

**Acceptance Scenarios**:

1. **Given** a user navigating to the Zenith dashboard, **When** the route renders, **Then** it seamlessly mounts the independent domain components located in the `features/dashboard` directory.
2. **Given** a code quality audit, **When** measuring `routes/index.tsx`, **Then** the file consists of less than 100 LoC and contains zero local business logic or large data arrays.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST intercept environment validation exceptions via a bootloader script or early plugin, successfully returning a static HTML "StartupError" diagnostic page rather than crashing the host Node.js process.
- **FR-002**: System MUST implement and utilize a centralized `TransactionManager` (from `@repo/appwrite-core`) inside the `createServerFn` boundaries in `apps/zenith/app/infrastructure/appwrite/server.ts` for all mutation operations.
- **FR-003**: System MUST extract all UI markup, local state (e.g., activeRange), and mock data hooks from `apps/zenith/app/routes/index.tsx` into a highly cohesive module located within `apps/zenith/app/features/dashboard/`.
- **FR-004**: System MUST strictly delegate RPC payload validation schemas to the shared Zod domain models located in `@repo/appwrite-core` instead of redefining raw Zod objects at the transport layers.

### Key Entities

- **TransactionManager**: Centralized class or context responsible for pushing operations onto a stack and orchestrating LIFO compensating actions upon any caught exception.
- **Bootloader / EnvConfig**: The entrypoint configuration responsible for parsing environment variables safely before the core routing modules initialize.
- **DashboardFeature**: A strictly bounded feature directory encapsulating all dashboard-specific components, hooks, and types.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With `SKIP_ENV_VALIDATION=false` and a missing `APPWRITE_API_KEY`, attempting to load the site immediately returns a 200 or 503 HTTP status containing the "Startup Configuration Error" interface instead of terminating the process.
- **SC-002**: A lines-of-code execution (`wc -l apps/zenith/app/routes/index.tsx`) outputs less than 100 lines.
- **SC-003**: A codebase audit verifies exactly zero direct `Service` mutation calls exist at the `createServerFn` boundary without a wrapping `TransactionManager` context.
- **SC-004**: A codebase audit validates that there are zero duplicated `.object()` schema definitions at the `createServerFn` boundary, directly importing `.parse()` functions from `@repo/appwrite-core`.
