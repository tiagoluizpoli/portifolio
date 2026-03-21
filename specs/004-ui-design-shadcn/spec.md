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
- Feedback 2026-03-21 → "Too rounded" (reduce roundness), "Desktop primary device" (optimize for 1920x1080+ while maintaining responsiveness).

## User Scenarios & Testing (mandatory)

### User Story 1 - Accessing the Zenith Hub (Priority: P1)

As an administrator, I want a high-level overview of the system's status and key metrics from the main dashboard.

**Why this priority**: Essential for monitoring and quick navigation.

**Independent Test**: Navigate to the Zenith root and verify dashboard layout, metrics cards, and sidebar.

**Acceptance Scenarios**:

1. **Given** I am logged into Zenith, **When** I view the homepage, **Then** I see the admin dashboard with core system metrics using Shadcn cards.
2. **Given** I am on any page, **When** I use the sidebar, **Then** I can navigate seamlessly between management sections.

---

### User Story 2 - Managing Users and Permissions (Priority: P1)

As a superuser, I want to see a list of all administrative users and their access levels.

**Why this priority**: Core management functionality.

**Independent Test**: Navigate to the User Management section and verify table layout and filter functionality.

**Acceptance Scenarios**:

1. **Given** I am in the "User Management" section, **When** I view the user list, **Then** I see a Shadcn DataTable with search and filter capabilities.

---

### User Story 3 - Configuring System Settings (Priority: P2)

As an admin, I want to update global configuration settings for the portfolio and other integrated services.

**Why this priority**: Allows for dynamic control of the environment.

**Independent Test**: Navigate to Settings and verify tabs/forms layout.

**Acceptance Scenarios**:

1. **Given** I am in the "Settings" section, **When** I use the tabs, **Then** I can switch between Appearance, System, and Portfolio configurations.

---

### Edge Cases

- **Large Datasets**: How does the UI handle long lists in the user management table? (Must use Shadcn Pagination/ScrollArea).
- **Unauthorized Access**: How are restricted sections indicated? (Shadcn Alert or Empty state).

## Requirements (mandatory)

### Functional Requirements

- **FR-001**: System MUST use Shadcn components for all UI elements (Tables, Cards, Tabs, Nav, etc.).
- **FR-002**: UI MUST follow a "Premium" administrative aesthetic (clean, direct, intelligent space usage).
- **FR-003**: Layout MUST include the following management screens: Dashboard Hub, Portfolio Manager, Settings.
- **FR-005**: Navigation MUST use a standard administrative sidebar or topbar layout.
- **FR-006**: System MUST use Google Stitch MCP for generating/iterating on these administrative screens.
- **DR-001**: Designs MUST prioritize a **Desktop-First** administrative experience (primary target: 1920x1080) while maintaining responsiveness for tablet/mobile.
- **DR-002**: Component roundness MUST be "Subtle/Medium" (e.g., Shadcn `rounded-md` (0.375rem) or `rounded-lg` (0.5rem)). Avoid extreme circularity or high-radius curves.
- **DR-003**: UI MUST NOT include any "Pro", "Upgrade", "Subscription", or "Pricing" elements. This is a strictly personal, private management tool.
- **DR-004**: UI MUST enforce **Extreme Density**. Default spacing tokens (padding, margin, gaps) MUST be minimized (e.g., `p-2` or `p-4` max for containers, `gap-2` for grids). Avoid excessive white space.
- **FR-010**: System MUST include a **Portfolio Analytics** module on the dashboard, displaying Visitors, Session Time (via 30s heartbeat), and Geographic data (Country/State).
- **DR-005**: UI MUST enforce **Row Symmetry**. All components within the same row (flex/grid) MUST have the same height using `items-stretch`.
- **FR-009**: Typography MUST follow a standardized hierarchy: Inter for UI and weighted headers (semibold) for section titles.
- **FR-010**: Global Search (Command-K) MUST focus on "Pages" and "Project Entries" for immediate navigation.
- **FR-011**: Portfolio Manager MUST implement an explicit "Save" action for all project entries, accompanied by a "Draft / Published" status toggle.
- **FR-012**: Administrative UI MUST display the core management sections (Dashboard, Portfolio, Settings).
- **FR-013**: UI MUST prioritize a clean, focused environment for single-user management.
- **FR-014**: Tables MUST implement **Infinite Scroll** for project listings to ensure smooth performance.

### Key Entities (include if feature involves data)

- **Zenith Dashboard**: The primary entry point for managing the ecosystem.
- **Management Section**: A specific area of functionality (e.g., Users, Settings).

## Success Criteria (mandatory)

### Measurable Outcomes

- **SC-001**: 100% of UI components in Zenith are derived from Shadcn UI library.
- **SC-002**: All 5 core management screens are implemented with premium styling.
- **SC-003**: Sidebar navigation allows switching between sections in under 2 clicks.
- **SC-004**: Design review confirms "Premium Admin Hub" feel and efficient data display.

