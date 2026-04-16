# Quickstart: @repo/appwrite

Seamless, type-safe Appwrite interaction with property normalization.

## Initialization

```typescript
import { createClient } from '@repo/appwrite';

const appwrite = createClient({
  projectId: process.env.APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY,
});
```

## Consuming Repositories

```typescript
import { MetricRepository } from '@repo/appwrite';

const repo = new MetricRepository(appwrite, 'db_id');

// Property normalization: $id -> id
const metric = await repo.findById('123');
console.log(metric.id); // '123'
console.log(metric.createdAt); // ISO String
```

## Using Specialized Services

### Metric Sync (Ghost Row Engine)
```typescript
import { MetricSyncService } from '@repo/appwrite';

const syncService = new MetricSyncService(repo);
await syncService.sync('about_doc_id', enMetric);
```

### Storage Orchestration
```typescript
import { StorageService } from '@repo/appwrite';

const storage = new StorageService(appwrite);
const file = await storage.upload({
  bucketId: 'pictures', // Resolved internally by env or logic
  file: base64String,
  name: 'profile.jpg'
});
```
