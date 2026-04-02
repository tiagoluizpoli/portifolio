# Zenith Management Hub: Screen Map

This document details the screens required for the Zenith Management Hub and the Shadcn components to be used for each.

## 1. Global Layout (`__root.tsx`)
**Goal**: The Digital Curator (Editorial & High-Density).
- **Sidebar**: `Sidebar` (Dashboard, Manager, Blog [WIP], Reports [WIP]). No dividers. Settings removed from bottom.
- **Topbar**: `Breadcrumb`, `Input` (Search), `Button` (Settings Gear icon), `DropdownMenu` (User profile).
- **Rounding**: Global `rounded-xl` (12px).

## 2. Dashboard Hub (`/`)
**Goal**: Zenith Hub: Portfolio Analytics (Baseline: `3d199cd1`).
- **KPI Grid**: 4 Cards (MAU, Session, Engagement, Projects).
- **Visitor Origins**: `ScrollArea` list with **Minimalist Flat Flag Icons** and density bars.
- **Visuals**: High-density masonry/grid, zero excessive whitespace.

## 3. Portfolio Manager (`/manager`)
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
