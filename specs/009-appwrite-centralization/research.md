## Decision: Property Mapping Strategy
**Rational**: To satisfy FR-PKG-004 ($id -> id normalization), the package will utilize a dedicated **Mapper Pattern**. Zod will be used to define "raw" and "domain" schemas separately for validation, but the actual property translation will be handled by a mapper utility to decouple validation logic from transformation logic.
**Alternatives considered**: Zod transformations (.transform). Rejected per user's preference for a decoupled mapper pattern.

## Decision: Repository Extensibility Pattern
**Rational**: The `BaseRepository` will expose `protected` query runners and a `protected` Appwrite Client. Concrete repositories can extend this to implement "Robust Queries" (e.g., complex filters, multi-collection lookups) while inheriting standard CRUD.
**Alternatives considered**: Composition-only. Rejected because it creates excessive boilerplate for standard CRUD operations that every collection needs.

## Decision: 100% Coverage Enforced
**Rational**: Use Vitest with `coverage.thresholds` set to `100` for lines, branches, functions, and statements. Any PR/Commit that drops below this will fail the CI/CD pipeline.
**Alternatives considered**: 90% threshold. Rejected per user's "MASTERMIND" mandate.

## Implementation Details

### Property Mapper Template
```typescript
export class DocumentMapper {
  static toDomain<T>(doc: Models.Document): T {
    const { $id, $createdAt, $updatedAt, ...rest } = doc;
    return {
      id: $id,
      createdAt: $createdAt,
      updatedAt: $updatedAt,
      ...rest,
    } as unknown as T;
  }

  static toAppwrite(data: any): any {
    const { id, createdAt, updatedAt, ...rest } = data;
    return rest; // Appwrite handles system fields on write
  }
}
```

### Extensible Base Repository Pattern
```typescript
/** 
 * Internal Interface - NOT exported
 */
interface IRepository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  // ...
}

/** 
 * Abstract Base - Overridable methods
 */
export abstract class BaseRepository<T extends { id: string }> implements IRepository<T> {
  constructor(protected sdk: Databases, protected dbId: string, protected collectionId: string) {}

  async findById(id: string): Promise<T | null> {
    const raw = await this.sdk.getDocument(this.dbId, this.collectionId, id);
    return DocumentMapper.toDomain<T>(raw);
  }

  // Built-in logic for robust query extensions
  protected async runQuery(queries: string[]) {
    return this.sdk.listDocuments(this.dbId, this.collectionId, queries);
  }
}
```
