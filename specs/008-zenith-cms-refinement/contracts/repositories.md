# Contracts: Repository Interfaces

Interface definitions for the implementation of storage and retrieval logic.

## 1. ISkillRepository
Updated to handle globalized competencies.

```typescript
export interface ISkillRepository {
  /**
   * Fetches the single global list of skills.
   */
  findAll(): Promise<Skill[]>;

  /**
   * Saves the global list of skills.
   */
  save(items: Skill[]): Promise<void>;
}
```

## 2. IMetricRepository Extensions
Updated to support semantic parity lookups.

```typescript
export interface IMetricRepository {
  /**
   * Finds all metric fragments sharing an internalCode.
   */
  findByCode(internalCode: string): Promise<ImpactMetric[]>;

  /**
   * Deletes all fragments sharing an internalCode.
   */
  deleteByCode(internalCode: string): Promise<void>;
}
```

## 3. IPlatformRepository (New)
Managed platform branding.

```typescript
export interface IPlatformRepository {
  findAll(): Promise<Platform[]>;
  findById(id: string): Promise<Platform | null>;
  create(data: Omit<Platform, 'id'>): Promise<Platform>;
  update(id: string, data: Partial<Platform>): Promise<Platform>;
  delete(id: string): Promise<void>;
}
```
