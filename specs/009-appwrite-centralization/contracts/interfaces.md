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
