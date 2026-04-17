## Repository Architecture

### 1. Internal Contract (Hidden)
The `IRepository` interface is internal to the package and defines the required shape for any persistence layer. It is NOT exported to consumers.

```typescript
interface IRepository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### 2. Abstract Base Repository (Implementation Foundation)
The `BaseRepository` is an **abstract class** that implements `IRepository`. It provides concrete, generic implementations for all CRUD operations using the `DocumentMapper`. 

- **Abstract**: Cannot be directly instantiated.
- **Overridable**: All methods provide a default logic but can be overridden by specific repositories for robust implementations.

```typescript
export abstract class BaseRepository<T extends { id: string }> implements IRepository<T> {
  async findById(id: string): Promise<T | null> {
    // Generic implementation using Mapper...
  }
  
  async findAll(): Promise<T[]> {
    // Generic implementation...
  }

  // ... other concrete CRUD methods
}
```

### 3. Exported Specialized Repositories
These are the only repositories exposed to consumers. They extend the base and add robust domain-specific logic.

```typescript
export class MetricRepository extends BaseRepository<ImpactMetric> {
  /** Override or extend for robust queries */
  async findByInternalCode(code: string): Promise<ImpactMetric | null> {
    // Specialized logic...
  }
}
```

## Specialized Interfaces

### IStorageService
Orchestrates file uploads, metadata management, and signed URL generation.
```typescript
export interface IStorageService {
  upload(payload: UploadPayload): Promise<StorageAsset>;
  getPreviewUrl(fileId: string, bucketId: string): Promise<string>;
  getFileInfo(fileId: string, bucketId: string): Promise<StorageAsset>;
}
```

### IMetricSyncService
Implements the "Ghost Row" propagation engine for multi-locale parity.
```typescript
export interface IMetricSyncService {
  sync(aboutId: string, source: ImpactMetric): Promise<void>;
  cleanup(aboutId: string, internalCode: string): Promise<void>;
}
```

### IEnvGroupLoader
Single public helper from shared env package for typed grouped resolution.

```typescript
type EnvGroupKey = 'appwrite' | 'database' | 'storage';

type EnvGroupFlags = {
  [K in EnvGroupKey]?: true;
};

interface EnvGroupMap {
  appwrite: {
    endpoint: string;
    endpointPublic?: string;
    projectId: string;
    apiKey: string;
    databaseId: string;
    curatorTeamId: string;
    bucketPicturesId?: string;
    bucketPdfsId?: string;
  };
  database: {
    url: string;
  };
  storage: {
    publicBaseUrl: string;
  };
}

export type EnvGroupResult<F extends EnvGroupFlags> = {
  [K in keyof F as F[K] extends true ? K : never]:
    K extends keyof EnvGroupMap ? EnvGroupMap[K] : never;
};

export declare function getEnv<F extends EnvGroupFlags>(
  flags: F,
): EnvGroupResult<F>;
```

### Appwrite Initialization Contract
`@repo/appwrite` is initialized from the typed output of `@repo/config` only.

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

### Consumption Rules
- Consumer apps must not read `process.env.APPWRITE_*` directly to build Appwrite runtime config.
- Runtime initialization values for `@repo/appwrite` must come from `getEnv(...)` typed group output.
- `@repo/appwrite` remains explicit-init only; no implicit auto-initialize behavior is allowed.
