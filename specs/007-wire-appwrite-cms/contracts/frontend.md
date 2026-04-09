# Frontend Contracts: Zenith CMS Wiring

This document defines the interface contracts between the Zenith CMS Frontend and the Appwrite Infrastructure layer.

## 1. Domain Object Contracts
These interfaces represent the "Ready for UI" state, transformed from the raw Appwrite documents.

### ContactData
```typescript
interface ContactData {
  email: string;
  phone: string;
  location: string;
  socials: SocialLink[];
}
```

### ExperienceItem/EducationItem
```typescript
interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  duration: string;
  description: string;
  sort: number;
  locale: 'en' | 'pt';
}

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  duration: string;
  description: string;
  sort: number;
  locale: 'en' | 'pt';
}
```

## 2. Server Function Contracts (RPC)
The Zenith app communicates with Appwrite exclusively through these `createServerFn` endpoints.

### fetchCmsSection
- **Input**: `{ section: string, locale: string }`
- **Output**: The Domain Object for that section (e.g., `HomeData`, `ContactData[]`).

### updateCmsSection
- **Input**: `{ section: string, data: Partial<DomainObject>, locale: string }`
- **Output**: `{ success: boolean, data: DomainObject }`

## 3. Form Validation (Zod)
The following Zod schemas are authoritative for all frontend forms.

- `homeSchema`: Validates name split (`firstName`, `lastName`), bio length, and year format.
- `skillsSchema`: Validates Iconify icon names and `type` enum.
- `solutionsSchema`: Conditional validation — `url` is required ONLY IF `hasExternalLink` is true.
- `historySchema`: Validates date ranges and markdown content.
