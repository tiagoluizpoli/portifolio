# Research: appwrite-migrator Refactor Architecture Decisions

## Decision 1: CLI Configuration Strategy
- **Option A**: Custom `parseFlags` method (current implementation).
- **Option B**: `Commander.js` only.
- **Option C**: **Commander.js + Zod Configuration Schema (Chosen)**.
- **Rationale**: 
  - `Commander` provides standardized flag extraction, help generation, and subcommand routing.
  - `Zod` provides absolute type safety and complex validation (e.g., mutually exclusive flags) at runtime.
  - Hybrid approach ensures the CLI "surface" is compliant with Node best practices while the "internal logic" is guaranteed to have valid inputs.

## Decision 2: Seeder Service Decomposition
- **Option A**: Maintain single `SeederService.ts` (Rejected: 811 lines violates Constitution).
- **Option B**: Split by entity (Rejected: High duplication across 11 tables).
- **Option C**: **Split by Lifecycle Stage (Chosen)**.
- **Rationale**: 
  - Segregates `Validator` (schemas), `Planner` (state calculation), `Executor` (rate-limited SDK calls), and `Generator` (artifacts).
  - Ensures each class maintains a Single Responsibility (SRP) and stays under the 300-line budget.

## Decision 3: Domain Integrity
- **Decision**: Implement **Branded Types** for IDs across the `@repo/appwrite-core` and app layer.
- **Rationale**: Prevents accidental swapping of `TableId` with `FileId` or `BucketId`, which are all strings but logically distinct. Enforces Principle VI (Type Safety).
