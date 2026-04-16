# Project Zenith: Appwrite Package Architectural Brief (Mastermind v3)

## Context
Implement the `@repo/appwrite` package as the singular, high-fidelity gateway to the Appwrite infrastructure. This iteration introduces strict property normalization ($id -> id), mandatory repository extensibility, and a zero-tolerance 100% test coverage policy.

## Specialists Engaged
*   **Appwrite Mastermind** (`appwrite`): Lead for SDK abstraction and property normalization.
*   **React Architect** (`react-architect`): Advisory for extendable repository patterns (Composition/Inheritance).
*   **Test Master** (`test-master`): Enforcer of the 100% coverage mandate and Vitest configuration.
*   **TanStack Master** (`tanstack-master`): Lead for contract-safety in consumption.

## Technical Requirements (Refined)

### 1. Property Normalization Layer ($ -> standard)
*   **Schema Transformation**: Every Zod schema MUST map Appwrite-internal properties (e.g., `$id`, `$createdAt`, `$updatedAt`, `$permissions`, `$collectionId`, `$databaseId`) to clean, standard names (e.g., `id`, `createdAt`, `updatedAt`).
*   **Bi-directional Mapping**: Repositories must handle the translation back to Appwrite naming for writes and normalization for reads.

### 2. Extensible Repository Architecture
*   **Base Repository**: Provides shared CRUD logic for standard Appwrite collections.
*   **Extension Points**: MUST allow specialized repositories to override or extend the base logic for "robust queries" (e.g., complex filters, multi-step transactions, or aggregate lookups) without violating the interface contract.

### 3. Verification & Testing
*   **100% Coverage**: Every branch, line, and edge case must be covered.
*   **Parity Verification**: The package must include utilities to verify shaped output against legacy `appwrite-core` results.
*   **Virtual SDK Mocking**: Exhaustive mocking of `node-appwrite` to test every failure mode.

## Success Criteria
*   **Zero SDK Leakage**: No consumer sees a property starting with `$`.
*   **Interface Stability**: Specialized repositories maintain the same base interface but add extended capabilities.
*   **Quality Gate**: `pnpm test` must fail if coverage < 100%.

## Governance
- **Named Exports**: Strict.
- **Components**: <300 lines (applicable to Service logic blocks).
- **Types**: Full type safety with Zod source-of-truth.
