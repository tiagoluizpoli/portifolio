# Research Results: Appwrite-Migrator Architectural Refactor

## Decision: Node.js 24 (LTS) Standardization
- **Rationals**: The user specifically requested Node 24 (LTS) for consistency across the codebase. Node 24 provides the latest ecosystem features and stable ESM support.
- **Alternatives considered**: Node 20 or 22 (other LTS versions), but Node 24 is the latest and aligns with the project's forward-looking 2026 standards.
- **Implementation**: Set `engines` in `package.json` to `^24.0.0` and update `.tool-versions` for `asdf`.

## Decision: Clean Architecture with SOLID classes
- **Rationals**: Move away from a 600-line monolithic `index.ts` to modular service classes. Use Dependency Injection (even if manual) to allow better testing and mockability.
- **Alternatives considered**: Keeping functions but splitting files. Rejected because the user specifically requested "Classes, SOLID, Clean Architecture".
- **Structure**:
  - `src/cli/`: Responsible for `process.argv` and `process.env`.
  - `src/services/`: Business logic implementations (Migrate, Seed, Template).
  - `src/core/`: Shared interfaces (`IMigratorService`) and domain models (Delta, Plan).

## Decision: Clean Imports with extensionless resolution
- **Rationals**: Use `moduleResolution: Bundler` in `tsconfig.json` to support extensionless imports in source. This provides the best DX as requested by the user.
- **Implementation**: For development, `tsx` handles resolution natively. For production, `tsc` + `tsc-alias` will be used.
- **Compatibility**: If `tsc` does not append `.js` extensions automatically (which it doesn't in ESM without specific flags), we will either:
    1. Use `tsx` directly in production (since it's a CLI tool, performance impact is negligible vs the DX gain).
    2. Use a post-build transform if `node` needs to run from `dist/` without a loader.
- **Decision**: Given it's a CLI tool, keeping `tsx` as the primary runner for both dev and prod in the monorepo is acceptable and ensures the "clean imports" remain functional without complex build chains.

## Decision: co-located Unit Tests and Centralized E2E
- **Rationals**: Co-locating unit tests follows "Screaming Architecture" where the test reveals the module's presence. Centralizing E2E tests in `tests/e2e` separates high-level flows from internal logic.
- **Alternatives considered**: All tests in `tests/`. Rejected to follow user preference for unit tests co-location.
