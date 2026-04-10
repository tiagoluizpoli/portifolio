# Research: Zenith CMS Refinement

This document outlines the architectural decisions and technical research for Feature 008.

## Decision 1: Skill Globalization Strategy
- **Decision**: Promoted 'en' skills to global scope; discard other locales.
- **Rationale**: User explicitly instructed to keep English as the source of truth to reduce administrative overhead and ensure a clean baseline.
- **Alternatives Considered**: Merging based on title (rejected to avoid duplicate icon conflicts and mastery level mismatches).

## Decision 2: Metric Parity Sync
- **Decision**: Domain-level service that triggers "Ghost Row" creation for alternate locales.
- **Rationale**: Ensures structural parity across languages without forcing immediate translation.
- **Technique**: Use `internalCode` (semantic kebab-case slug) as the primary linking key.

## Decision 3: Home Split-Layout
- **Decision**: 1:1 CSS Grid (left: form; right: asset viewers).
- **Rationale**: Immediate visual feedback for Picture and CV assets.
- **Form Management**: Use TanStack Form v12+ with `zod-form-adapter`.

## Decision 4: Managed Platforms
- **Decision**: Dedicated `Platforms` collection in Appwrite.
- **Rationale**: Consistent branding across social links. Integrated `IconPicker` for icon management.

## Integration Patterns
- **Standardized Actions**: Unified `CmsSaveButton` component to be reused across all sections.
- **Routing**: Use `portfolio-cms/` prefix for all administrative routes.
- **Type Safety**: Shared types in `@repo/appwrite-core` enforced across migrator and zenith.
