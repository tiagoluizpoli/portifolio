# Section Audit: Socials & Platforms

## Current Implementation vs Requirement

| Feature | Requirement | Current State | Status |
| :--- | :--- | :--- | :--- |
| **Data Model** | Managed `Platform` Entity | Flat strings in `ContactForm` | **CRITICAL VIOLATION** |
| **Platform Source** | DB-populated `PlatformSelect` | Manual entry | **MISSING** |
| **Management UI** | Side-Drawer Platform Manager | None | **MISSING** |
| **Iconography** | `IconPicker` integration | None (Static mapping) | **MISSING** |

## Required Technical Adjustments

### 1. Domain Model Expansion (`appwrite-core`)
- Define `Platform` entity and repository interfaces (as indicated in constitution §XVII).
- Migrator must seed standard platforms (LinkedIn, X, GitHub).

### 2. Component Refactoring (`ContactForm`)
- Replace the string-based social list with a relational one that refers to `platformId`.
- Implement `PlatformSelect` (Combobox) that fetches active platforms.

### 3. Management Drawer
- Create a reusable `PlatformDrawer` for adding/editing platform metadata (Icon, Name, URL Template).

[← Back to Report](file:///home/tiago/01-dev-env/personal-repos/portifolio/.specify/analysis/zenith_cms_sync/report.md)
