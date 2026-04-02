# Feature Specification: Zenith UI Design Phase (Shadcn First)

**Feature- **Dashboard**: High-density Overview featuring:
  - **Core KPIs**: Visitors (Count, Trend), Avg. Session Time, Active Projects.
  - **Geographic distribution**: Top Countries/States of visitors (Simplified list or mini-map).
  - **Recent Activity**: Streamlined log of portfolio interactions.
- **Portfolio Manager**: Centralized CRUD for project entries (metadata, descriptions, media links).
- **System Settings**: Global appearance and basic configuration.

## Clarifications

### Session 2026-03-21
- Q: Global Search (Command-K) Behavior → A: Option A (Hierarchical search with direct navigation).
- Q: Portfolio Manager Save Lifecycle → A: Option A (Explicit Save button + "Draft/Published" status toggle).
- Q: User Role UI Differentiation → A: Option C (No UI differentiation for now; all sections visible for styling).
- Q: Real-time UI Indicators → A: Option A (Design with "Live" badges and pulsing indicators; purely visual for now).
- Q: Table Navigation Pattern → A: Option A (Infinite Scroll with virtualized rows).
- Q: Analytics Heartbeat → A: Option A (30s heartbeat for session duration tracking).
- Q: Symmetry Strategy → A: Option A (Local row-based flex stretching).
- Q: User Management Scope → A: Option B (Single-owner; remove Multi-Admin features).
- Q: Geolocation Strategy → A: IP-based lookup for Country + State (Privacy-preserving; no browser prompts/GPS).
- Q: Connection Lost Save Handling → A: Option B (Block Save + Warning).
- Q: Terminology Normalization → A: Accepted (Use "Zenith Hub" as the canonical term).
- **Design System**: Oceanic Obsidian (Mandatory).
- **Layout Density**: High density; maximize screen usage.
- **Visitor Origins**: Use **Flat Flag ICONS** (Rectangular, minimalist stripes, as per reference). **NO real images/waving**.

### Session 2026-03-27
- Q: Scope Alignment & Definition of Done → A: Dashboard/Shell + **Portfolio Manager** (for migrated data). Blog/Reports remain deferred.
- Q: System Settings MVP Priority → A: Option B (Functional priority is **Global Metadata**: App Title, Version, and Admin Profile: Avatar/Name).
- Q: Command-K Search Scope → A: Option A (Focus on **Navigation & Quick Actions** like "Toggle Theme", "Settings").
- Q: Dashboard Data Behavior → A: **Static Mocks** (No real-time updates for now).
- Q: Portfolio Manager Entity Scope → A: **All 7 Migrated Entities**: Home, Experience, Education, Skills, Solutions (Projects), Socials, and Contact Info.

---

## Architecture-Level Test Plan (Constitution §XVIII)

To ensure the technical integrity of the Zenith Hub, the following testing strategy is mandatory:

### BDD Strategy (Playwright)
- **Focus**: Global Shell Symmetry, Navigation, and Core Metadata persistence. 
- **Tests**: 
  - Verify Sidebar/Topbar layout symmetry under high density (`items-stretch`).
  - Verify `Command-K` navigation between Dashboard and Settings.
  - Verify the Settings form persists to Appwrite and updates the Topbar UI.
- **Success Criteria**: 100% of P1 user stories pass in a headless browser environment.

### TDD Strategy (Vitest)
- **Focus**: Server Actions, Repository logic, and Mock Data Engine.
- **Tests**:
  - Unit tests for `SystemConfigRepository` ensuring Zod schema validation.
  - Unit tests for the `MockDataEngine` ensuring stable, seed-based metric generation.
  - Integration tests for `AppwriteExceptionMapper`.
- **Immutability**: Once established, these tests are **IMMUTABLE** (Constitution §XXI).

---

## SOLID & Security Mapping (Constitution §XIX, §XX)

### SOLID Mapping
- **Single Responsibility (SRP)**: Isolate UI rendering from data fetching via dedicated Application Services.
- **Dependency Inversion (DIP)**: UI components depend on repository interfaces, not concrete Appwrite implementations.
- **Open-Closed (OCP)**: The Sidebar is designed to receive a navigation schema, allowing new items without modifying the sidebar core.

### Security Boundary Map
| Component | Boundary | Rationale |
|-----------|----------|-----------|
| **UI Rendering** | Client | Pure React 19 / TanStack Start (Default). |
| **Data Fetching** | Server | **Server Functions** to hide Appwrite API Keys and secrets. |
| **Validation** | Both | Client-side for UX; Server-side for Integrity (Zod). |
| **Auth State** | Server | Managed strictly by Appwrite session cookies. |

## User Scenarios & Testing (mandatory)

### User Story 1 - Accessing the Zenith Hub (Priority: P1)

As an administrator, I want a high-level overview of the system's status and key metrics from the main dashboard.

**Why this priority**: Essential for monitoring and quick navigation.

**Independent Test**: Navigate to the Zenith root and verify dashboard layout, metrics cards, and sidebar.

**Acceptance Scenarios**:

1. **Given** I am logged into Zenith, **When** I view the homepage, **Then** I see the admin dashboard with core system metrics using Shadcn cards.
2. **Given** I am on any page, **When** I use the sidebar, **Then** I can navigate seamlessly between management sections.

---

---

---

### User Story 3 - Configuring System Settings (Priority: P2)

As an admin, I want to update global configuration settings for the portfolio and other integrated services.

**Why this priority**: Allows for dynamic control of the environment.

**Independent Test**: Navigate to Settings and verify tabs/forms layout.

**Acceptance Scenarios**:

1. **Given** I am in the "Settings" section, **When** I use the "System" tab, **Then** I can update the Application Title, Version string, and my Administrator Profile (Name/Avatar).

---

### Edge Cases

- **Large Datasets**: How does the UI handle long lists in the user management table? (Must use Shadcn Pagination/ScrollArea).
- **Unauthorized Access**: How are restricted sections indicated? (Shadcn Alert or Empty state).
- **Offline Save Attempt**: If user clicks "Save" while connection is lost, button MUST be disabled/blocked with a "Connection Lost" warning.

## Requirements (mandatory)

### Functional Requirements

- **FR-001**: System MUST use Shadcn components for all UI elements (Tables, Cards, Tabs, Nav, etc.).
- **FR-002**: UI MUST follow a "Premium" administrative aesthetic (clean, direct, intelligent space usage).
- **FR-003**: Layout MUST include management screens for all 7 core entities: Dashboard, Home, Experience, Education, Skills, Solutions (Projects), Socials, and Contact Info.
- **FR-005**: Navigation MUST use a standard administrative sidebar (Dashboard, Portfolio Manager [7 Entities], Blog [Construction], Reports [Construction]). **Settings MUST be located in the Topbar**.
- **FR-006**: System MUST use Google Stitch MCP for generating/iterating on these administrative screens.
- **DR-001**: Designs MUST prioritize a **Desktop-First** experience (1920x1080). On **Mobile/Tablet**, the Interactive Sidebar MUST transition to a Shadcn `Sheet` (Drawer) triggered by a top-left hamburger menu.
- **DR-006**: Appwrite Collections (`projects`, `analytics`) MUST be configured with **Private/Owner-Only** permissions; only the authenticated owner can access management data.
- **DR-002**: Component roundness MUST be "Subtle/Medium" (e.g., Shadcn `rounded-md` (0.375rem) or `rounded-lg` (0.5rem)). Avoid extreme circularity or high-radius curves.
- **DR-003**: UI MUST NOT include any "Pro", "Upgrade", "Subscription", or "Pricing" elements. This is a strictly personal, private management tool.
- **DR-004**: UI MUST enforce **Extreme Density**. Default spacing tokens (padding, margin, gaps) MUST be minimized (e.g., `p-2` or `p-4` max for containers, `gap-2` for grids). Avoid excessive white space.
- **FR-007**: System MUST define and implement **Zero-states** (Empty states) for all tables and grids using Shadcn Ghost components or Skeletons.
- **FR-010**: System MUST include a **Portfolio Analytics** module on the dashboard, displaying Visitors, Session Time (via 30s heartbeat), and Geographic data (Country/State).
- **FR-011**: System MUST define a **Session** as 30 minutes of inactivity; heartbeats MUST cease when the tab is hidden or inactive.
- **DR-005**: UI MUST enforce **Row Symmetry**. All components within the same row (flex/grid) MUST have the same height using `items-stretch`.
- **FR-012**: Typography MUST use **Geist Sans** for UI and **Geist Mono** for data/code displays, integrated directly into the Tailwind v4 @theme.
- **FR-013**: Typography hierarchy MUST follow a standardized model: Geist Sans for UI and weighted headers (semibold) for section titles.
- **FR-014**: Global Search (Command-K) MUST focus on **Navigation** (Pages) and **Quick Actions** (e.g., "Toggle Theme", "Reset View") for immediate administrative control.
- **FR-015**: Portfolio Manager MUST implement an explicit "Save" action for all project entries, accompanied by a "Draft / Published" status toggle.
- **FR-016**: Administrative UI MUST display the core management sections (Dashboard, Portfolio, Settings).
- **FR-017**: UI MUST prioritize a clean, focused environment for single-user management.
- **FR-018**: Tables MUST implement **Infinite Scroll** for project listings with a < 200ms TBT performance target.
- **FR-019**: System MUST provide **Offline Indicators** (Toasts/Badges) and a "Last Cached" timestamp when Appwrite connection is lost. **Save actions MUST be blocked/disabled** during offline states to prevent data loss.
- **FR-020**: First-time users (no data) MUST be presented with a **"Getting Started" Dashboard** featuring Skeletons and a guide to create their first Portfolio Entry.
- **FR-021**: System MUST achieve **identical OKLCH variable mapping** to Stitch designs as the baseline for semantic fidelity. [Constitution §XVII]
- **FR-022**: System MUST persist **Global Metadata** (App Title, Admin Profile) in the Appwrite `config` collection, using a server-side repository and Zod validation. [Constitution §II, §XV]
- **FR-023**: All Appwrite interactions MUST use the v22+ `TablesDB` service with **object-parameter style**. [Constitution §XIII]

### Key Entities (include if feature involves data)

- **Zenith Dashboard**: The primary entry point for managing the ecosystem.
- **Portfolio Entities**: Home, Experience, Education, Skills, Solutions, Socials, Contact Info.
- **Management Section**: A specific area of functionality (e.g., Settings).

## Success Criteria (mandatory)

### Measurable Outcomes

- **SC-001**: 100% of UI components in Zenith are derived from Shadcn UI library.
- **SC-002**: Global Administrative Shell and **Portfolio Manager** screens are implemented with premium styling.
- **SC-003**: Sidebar navigation allows switching between sections in under 2 clicks.
- **SC-004**: Design review confirms "Premium Administrative Shell" feel and efficient management of migrated data.

