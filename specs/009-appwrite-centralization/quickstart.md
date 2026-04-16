# Quickstart: @repo/appwrite

Seamless, type-safe Appwrite interaction with property normalization.

## Initialization

```typescript
import { getEnv } from '@repo/config';
import { initializeAppwrite } from '@repo/appwrite';

const env = getEnv({ appwrite: true });

initializeAppwrite({
  endpoint: env.appwrite.endpoint,
  projectId: env.appwrite.projectId,
  apiKey: env.appwrite.apiKey,
});
```

## Consuming Repositories

```typescript
import { ImpactMetricRepository } from '@repo/appwrite';

const repo = new ImpactMetricRepository('database_id');

const metric = await repo.findById('123');
console.log(metric?.id);
```

## Using Specialized Services

### Metric Sync (Ghost Row Engine)
```typescript
import { MetricSyncService } from '@repo/appwrite';

const syncService = new MetricSyncService();
await syncService.sync('about_doc_id', enMetric);
```

### Storage Orchestration
```typescript
import { StorageService } from '@repo/appwrite';

const storage = new StorageService();
const file = await storage.upload({
  kind: 'picture',
  file: inputFile,
  name: 'profile.jpg',
});
```

## Shared Env Package Helper

```typescript
import { getEnv } from '@repo/config';

const env = getEnv({ appwrite: true, database: true });

env.appwrite.endpoint;
env.database.url;
```
