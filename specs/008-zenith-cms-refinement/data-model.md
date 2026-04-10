# Data Model - Zenith CMS Refinement

This document defines the schema changes and new entities for the Zenith Portifolio CMS.

## Entities

### 1. Skill (Modified)
Represents a professional competency. Now has global scope.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (Appwrite ID). |
| `title` | `string` | Display name of the skill. |
| `icon` | `string` | Iconify code. |
| `type` | `string` | Category (Frontend, Backend, etc.). |
| `status` | `string` | Publication status (Draft, Published). |
| `sort` | `number` | Display order. |

> [!NOTE]
> The `locale` field is removed. The system fetches a single collection for all languages.

---

### 2. ImpactMetric (Modified)
Represents a quantifiable achievement. Linked across locales via `internalCode`.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (Appwrite ID). |
| `internalCode` | `string` | Semantic kebab-case name linking translations (e.g., `active-users`). |
| `label` | `string` | Localized name. |
| `value` | `string` | Localized value (if manual). |
| `sourceId` | `string` | ID of the dynamic source (if applicable). |
| `sourceKey` | `string` | Field key in the dynamic source (if applicable). |
| `locale` | `string` | The language of this specific record. |

> [!IMPORTANT]
> **Constraint**: The combination of `(locale, internalCode)` MUST be unique.

---

### 3. Platform (New)
Managed entity for social networks and external branding.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (Appwrite ID). |
| `name` | `string` | Internal name (e.g., GitHub, LinkedIn). |
| `iconCode` | `string` | Iconify code (e.g., `simple-icons:github`). |
| `status` | `string` | active / inactive. |

## Relationships

- **ImpactMetric → Source**: One Metric can optionally link to a dynamic source table (manual creation in Appwrite).
- **Contact → Platform**: Social contacts will select an existing `Platform` ID instead of entering a platform name/icon manually.
