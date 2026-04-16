# Data Model: @repo/appwrite

This document defines the 11 core entities and their normalized structures within the centralized Appwrite package.

## Core Normalization Rules
All entities in this package MUST follow these normalization rules during SDK transformation via the `DocumentMapper`:
- `$id` ➔ `id`
- `$createdAt` ➔ `createdAt`
- `$updatedAt` ➔ `updatedAt`
- `$permissions` ➔ `permissions`
- All other properties match exactly the Appwrite attribute name.

## Schema Layers
1. **Appwrite Schema**: Matches the raw Appwrite SDK output (uses `$` prefix for system fields).
2. **Domain Schema**: Matches the optimized consumer output (standardized naming).

---

## Entities

### 1. About
- **id**: string
- **name**: string
- **title**: string
- **bio**: string
- **locale**: string ('en' | 'pt')

### 2. Home
- **id**: string
- **locale**: string
- **heroTitle**: string
- **heroSubtitle**: string
- **ctaText**: string
- **ctaLink**: string

### 3. ContactInfo
- **id**: string
- **locale**: string
- **email**: string
- **phone**: string
- **location**: string

### 4. Social
- **id**: string
- **platformId**: string
- **username**: string
- **iconId**: string (Ref: Storage)
- **active**: boolean
- **sort**: number

### 5. Platform
- **id**: string
- **title**: string
- **urlTemplate**: string
- **iconCode**: string
- **status**: string ('active' | 'archived')
- **sort**: number

### 6. Solution
- **id**: string
- **locale**: string
- **title**: string
- **description**: string
- **iconCode**: string
- **sort**: number

### 7. Skill
- **id**: string
- **title**: string
- **type**: string ('frontend' | 'backend' | 'fullstack')
- **iconCode**: string
- **status**: string ('active' | 'archived')
- **sort**: number

### 8. Education
- **id**: string
- **locale**: string
- **title**: string
- **organization**: string
- **location**: string
- **period**: string
- **description**: string
- **current**: boolean
- **sort**: number

### 9. Experience
- **id**: string
- **locale**: string
- **title**: string
- **organization**: string
- **location**: string
- **period**: string
- **description**: string
- **current**: boolean
- **sort**: number

### 10. ImpactMetric
- **id**: string
- **aboutId**: string (Ref: About)
- **internalCode**: string
- **locale**: string
- **label**: string
- **value**: string
- **sourceId**: string (Ref: MetricSource)
- **isPlaceholder**: boolean

### 11. MetricSource
- **id**: string
- **name**: string
- **type**: string
- **iconCode**: string
- **status**: string
