# Research: Zenith High-Rigor Architecture (Shell Refactor)

This research resolves the requirements from the **Zenith Constitution v1.9.0** and the **TanStack Master Skill**.

## Decision: Mock Data Engine (P1)
**Rationale**: Per user feedback, real analytics are deferred until the portfolio integration. We will implement a `MockDataEngine` service inside `app/services/` to provide consistent, high-fidelity mock data for the dashboard.
- **Strategy**: Use a seed-based randomizer to ensure stable mock data during development.
- **Scope**: Visitors (Count, Trend), Session Time, Geographic Distribution (Mocked flags).

## Decision: Shell Symmetry & Spacing (P1)
**Rationale**: To ensure "Intelligent Space Usage" (Spec §DR-004), the Administrative Shell will follow a strict symmetry grid:
- **Sidebar**: Fixed width (e.g., 256px), padding-y of `p-4` (16px), and `gap-2` (8px) for nav items.
- **Topbar**: Height of `h-16` (64px) with `px-4` padding.
- **Content Area**: `p-6` (24px) with nested cards using `gap-4` (16px).
- **Rounding**: Global `rounded-xl` (12px) for cards and `rounded-lg` (8px) for interactive elements.

## Decision: Infrastructure Sealing (Appwrite)
**Rationale**: Secure initialization of the Appwrite client in `app/services/appwrite.server.ts`, ensuring it is ONLY accessible via `createServerFn`. Logic in `@repo/appwrite-core` will be mapped to clean domain interfaces (IRepository).

---

## Decision: Security Boundary Map (Principle XX)

| Logic/Data Component | Location | Component Type | Rationale |
| :--- | :--- | :--- | :--- |
| **User Authentication** | Server | Middleware / Server Fn | Prevent data leakage; only authenticated owner can access. |
| **System Configuration**| Server | Server Function | Secure persistence of admin preferences. |
| **Mock Data Loaders** | Client | Standard React Hook | Fast, reactive dashboard without server overhead. |
| **Theme/Sidebar Toggle** | Client | Standard React Hook | Browser state only. |

---

## Decision: Architecture-Level Test Plan (Principle XVIII)

### BDD (Playwright) - Shell Stability
- **Scenario**: Admin toggles sidebar and verifies the layout shift.
- **Scenario**: Admin navigates between Dashboard and Settings via the Sidebar.
- **Immunity**: This test MUST NEVER be changed without user prompting.

### TDD (Vitest) - Core Logic
- **Module**: `mockDataEngine.ts` -> Verify consistent seed-based generation.
- **Module**: `appwrite.server.ts` -> Verify that secrets are isolated from the client bundle.

---

## Out of Scope (Deferred)
- **Project Manager**: Postponed until portfolio data structure is finalized.
- **Real Analytics**: Awaiting Portfolio integration.
- **Multi-Role Navigation**: Zenith Hub is single-owner only.
