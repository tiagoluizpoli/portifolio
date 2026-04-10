# Research & Outline - Zenith CMS Refinement

This document resolves the technical unknowns identified in the implementation plan for the Zenith Portifolio CMS refinement.

## Migration & Data Strategy

### 1. Skill Globalization (FR-004)
- **Decision**: Use the English (`en`) locale as the authoritative baseline.
- **Rationale**: User opted for Option A to ensure a clean, verified source of truth during the structure flattening.
- **Migration Logic**:
    - Select all skills where `locale == "en"`.
    - Drop the `locale` field from the schema.
    - Delete orphan localized skills.

### 2. Impact Metric Parity (FR-006 / SC-002)
- **Decision**: Strict Parity (Option A).
- **Rationale**: Immediate creation of placeholders (ghost rows) ensures cross-language awareness and prevents data layout drift.
- **Logic**:
    - **Creation**: On `ImpactMetric.create`, generate records with the same semantic `internalCode` (kebab-case) for all $N$ supported locales.
    - **Deletion**: On `ImpactMetric.delete`, cascade the deletion to all records sharing the `internalCode`.
    - **Uniqueness**: The pair `(locale, internalCode)` must be unique.

### 3. Dynamic Source Persistence (US2)
- **Decision**: Manual entry by default.
- **Rationale**: User will define sources manually in Appwrite; the CMS will allow selection from these existing sources or manual overrides.

### 4. Platform Pre-seeding (FR-003)
- **Decision**: Pre-seed standard platforms (GitHub, LinkedIn, Twitter/X, Instagram, Discord, Email, Resume).
- **Rationale**: Centralized branding management.
- **Initial Mappings**:
    - GitHub: `simple-icons:github`
    - LinkedIn: `simple-icons:linkedin`
    - X (Twitter): `simple-icons:x`
    - Instagram: `simple-icons:instagram`
    - Discord: `simple-icons:discord`
    - Email: `lucide:mail`
    - Resume/CV: `lucide:file-text`

## Routing & Shell (FR-002)
- **Prefix**: `/portfolio-cms/`.
- **Navigation**: Update Sidebar and Breadcrumbs to reflect "Portfolio CMS".

## Component Standardization (FR-001)
- **CmsSaveButton**: Unified styling, integrated with `CmsContext` state.
