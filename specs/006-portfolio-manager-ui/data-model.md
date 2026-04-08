# Data Model: Portfolio Manager

## Shared Types

```typescript
type I18nString = {
  en: string;
  pt: string;
};
```

## Entities (Aligned with Migrator Seed)

### 1. Home
- `id`: string (e.g., `home-en`)
- `locale`: 'en' | 'pt'
- `name`: string
- `title`: string (Headline)
- `description`: string (Bio)
- `pictureId`: string (Appwrite File ID - Shared across locales)
- `cvId`: string (Appwrite File ID - Distinct per locale)

### 2. Experience
- `id`: string (e.g., `exp-company-en`)
- `locale`: 'en' | 'pt'
- `company`: string
- `role`: string
- `duration`: string
- `description`: string
- `sort`: number

### 3. Education
- `id`: string (e.g., `edu-institution-en`)
- `locale`: 'en' | 'pt'
- `institution`: string
- `degree`: string
- `duration`: string
- `description`: string
- `sort`: number

### 4. Skills
- `id`: string (e.g., `skill-react`)
- `title`: string (Name of the skill)
- `icon`: string (Iconify ID)
- `category`: string (Frontend, Backend, etc.)
- `sort`: number

### 5. Solutions
- `id`: string (e.g., `sol-title-en`)
- `locale`: 'en' | 'pt'
- `title`: string
- `description`: string
- `icon`: string
- `sort`: number

### 6. Socials
- `id`: string (e.g., `social-github`)
- `type`: string (Platform name)
- `link`: string
- `icon`: string
- `sort`: number

### 7. Contact Info
- `id`: string (e.g., `contact-email-en`)
- `locale`: 'en' | 'pt'
- `type`: string (Label: Email, Location, etc.)
- `value`: string
- `icon`: string
- `sort`: number
