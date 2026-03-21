# Zenith Management Hub: Screen Map

This document details the screens required for the Zenith Management Hub and the Shadcn components to be used for each.

## 1. Global Layout (`__root.tsx`)
**Goal**: Professional administrative navigation.
- **Sidebar**: `Sheet` or `Sidebar` component (Links: Dashboard, Users, Portfolio, Settings, Logs).
- **Topbar**: `Breadcrumb`, `Input` (Global search), `DropdownMenu` (User profile), `ThemeToggle`.
- **Branding**: "Zenith" logo with premium typography.

## 2. Dashboard Hub (`/`)
**Goal**: High-level overview of ecosystem health.
- **KPI Grid**: 4x `Card` components showing (Users, Projects, Active Sessions, Errors).
- **Recent Activity**: `ScrollArea` with a list of recent events.
- **Status Indicators**: `Badge` or `Progress` components for system health.

## 3. User Management (`/users`)
**Goal**: Administate access control.
- **Data Table**: `Table` with row selection, sorting, and pagination.
- **Search/Filter**: `Input` + `Select` (Filter by Role, Status).
- **Actions**: `Button` (Invite User, Edit, Delete).

## 4. Portfolio Manager (`/manager`)
**Goal**: Manage entries for the main portfolio app.
- **Content Grid**: Responsive cards showing project entries.
- **Editor**: `Dialog` or `Sheet` with a `Form` to create/edit projects.
- **Media Manager**: Placeholder for image uploads.

## 5. System Settings (`/settings`)
**Goal**: Centralized configuration.
- **Navigation**: `Tabs` (Categories: General, Profile, Appearance, Portfolio).
- **Forms**: `Form` based configuration blocks.

## 6. Audit Logs (`/logs`)
**Goal**: Accountability and tracking.
- **Timeline**: Clean list display of all administrative actions.
