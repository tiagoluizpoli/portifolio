# Data Models: Refactoring Zenith Architecture

*Note: This feature does not introduce new AppWrite schemas or database collections. It strictly deals with execution orchestration (TransactionManager) and startup configuration validation.*

## Core Service Interfaces

### 1. TransactionManager Context
An orchestration boundary designed for LIFO compensations.

```typescript
interface CompensatingAction {
  id: string;
  rollback: () => Promise<void>;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
}

interface ITransactionManager {
  push: (action: CompensatingAction) => void;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  execute: <T>(task: (tx: ITransactionManager) => Promise<T>) => Promise<T>;
}
```

### 2. Startup Validation Schema
Based on Domain Models in `@repo/appwrite-core`, strictly ensuring environment variables are loaded prior to route orchestration.

```typescript
// Inherits the appwriteEnvSchema from @repo/appwrite-core
```
