# Data Model: Zenith CMS Refinement

Definitions for updated and new entities in `@repo/appwrite-core`.

## 1. Skill (Update: Globalized)
Represents a professional competency.
- **Table**: `skills`
- **Scope**: Global (No `locale` attribute)
- **Attributes**:
  - `id`: string (Appwrite ID)
  - `title`: string
  - `iconCode`: string (Iconify identifier)
  - `type`: 'frontend' | 'backend' | 'fullstack' | 'hard' | 'soft' | 'tool'
  - `status`: 'active' | 'archived'
  - `sort`: integer

## 2. ImpactMetric (Update: Linked)
Represents a quantifiable achievement with cross-locale parity.
- **Table**: `impact_metrics`
- **Scope**: Localized (belongs to `About`)
- **Attributes**:
  - `id`: string
  - `aboutId`: string (Reference to localized About record)
  - `internalCode`: string (Semantic kebab-case slug; e.g., 'active-users')
  - `label`: string
  - `value`: string (Localized value for manual entries)
  - `locale`: string (The language of this specific record)
  - `sourceId`: string (Reference to MetricSource)
  - `sourceKey`: string (Field key in dynamic source)

## Constraints
- **Unique Linkage**: The combination of `(locale, internalCode)` MUST be unique at the database level.
- **Metric -> Source**: 1:1 via `sourceId`.

## 3. Platform (New: Managed)
Branding entities for social and professional networks.
- **Table**: `platforms`
- **Scope**: Global
- **Attributes**:
  - `id`: string
  - `name`: string (e.g., 'LinkedIn', 'GitHub')
  - `iconCode`: string
  - `status`: 'active' | 'inactive'

## Relationships
- **Metric -> Source**: 1:1 via `sourceId`.
- **Metric -> Locale Parity**: Multi-locale linkage via `internalCode`.
- **Skill -> Locale**: N/A (Promotion to Global).
