# Data Models: Zenith Setup

## Entities

### Project (Appwrite Internal)
Shared domain representation of an Appwrite project context.
- `id`: string (UUID or internal ID)
- `name`: string (min 3 chars)
- `environment`: 'development' | 'production' | 'staging'
- `createdAt`: string (ISO)

### Standard Domain Exception
Consistency for FR-010 mapping.
- `code`: string (e.g. `USER_NOT_FOUND`)
- `status`: number (e.g. 404)
- `message`: string
- `details`: any (optional)

## Zod Schemas (`@repo/appwrite-core`)

```typescript
import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(3),
  environment: z.enum(['development', 'production', 'staging']),
  createdAt: z.string().datetime(),
});

export const ExceptionSchema = z.object({
  code: z.string(),
  status: z.number(),
  message: z.string(),
  details: z.any().optional(),
});
```
