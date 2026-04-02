# Data Model: Zenith Hub (Administrative Shell)

This document defines the schema and validation layers for the Zenith administrative application, focusing on the configuration of the shell and management of migrated portfolio entities.

## 1. System Configuration (Appwrite `config` collection)
Stores global application settings managed in the **Settings** section.

| Field | Type | Description | Validation (Zod) |
|-------|------|-------------|------------------|
| `app_title` | `string` | The title displayed in Topbar/Head. | `z.string().min(1).max(50)` |
| `app_version` | `string` | Current deployment version. | `z.string()` |
| `admin_name` | `string` | Display name for the administrator. | `z.string()` |
| `admin_avatar` | `url` | URL to the admin's profile image. | `z.string().url()` |
| `maintenance_mode`| `boolean`| Whether the portfolio is in maintenance. | `z.boolean()` |

## 2. Portfolio Management Entities (Migrated)
These entities are managed via the **Portfolio Manager** and reflect the schema defined in `specs/002-appwrite-infra-migration`.

### 2.1 Home
- `title` (Localized EN/PT)
- `bio` (Localized EN/PT)
- `hero_image_url`
- `cv_url`

### 2.2 Experience / Education
- `institution`
- `role_or_degree`
- `start_date`
- `end_date` (Optional)
- `description` (Localized EN/PT)

### 2.3 Skills
- `name`
- `category` (Frontend, Backend, etc.)
- `proficiency` (0-100)
- `icon_id` (Lucide or SVG slug)

### 2.4 Solutions (Projects)
- `name`
- `description` (Localized EN/PT)
- `technologies` (Array of Skill references)
- `thumbnail_url`
- `is_migrated` (Boolean)

### 2.5 Socials / Contact
- `platform`
- `url`
- `icon`
- `is_active`

## 3. Mock Analytics (Temporary)
Used to populate the dashboard KPIs during Phase 1.

| Metric | Type | Source |
|--------|------|--------|
| `visitors_count` | `number` | Static Mock |
| `avg_session_time`| `string` | Static Mock |
| `active_projects` | `number` | Static Mock |
| `geo_distribution`| `JSON` | Static Mock (Flag codes) |
