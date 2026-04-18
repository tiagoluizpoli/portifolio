# Test Plan: Appwrite-Migrator Refactor

## Authoritative Testing (Constitution Principle XXI)
Automated tests are the authoritative source of truth for feature behavior. Once established, tests are IMMUTABLE. They cannot be modified to align with implementation code without explicit justification. Tests ENFORCE correctness; they do not follow code.

## Coverage Strategy
- **Unit Tests**: 100% coverage for all service classes, CLI parsing logic, and domain mappers.
- **Integration Tests**: Verify end-to-end command orchestration using Appwrite mocks.
- **E2E Tests**: Verify real interaction with Appwrite via the `final-voyage` journey.

## Test Case Definitions

### Unit Tests (Co-located in `src/`)
- `MigratorCli`: Verify flag parsing, environment loading, and error handling for conflicting flags.
- `SeedService`: Verify payload reading from storage, validation logic, and plan execution.
- `MigrationService`: Verify structural delta calculation and migration execution.
- `TemplateService`: Verify JSON and Markdown artifact generation.
- `CheckService`: Verify audit logic returns the correct delta status.

### E2E / Journey Tests (Located in `tests/e2e/`)
- `final-voyage`: The definitive user journey for the migrator. Must pass in a staging environment.

## Guardrails
- `pnpm typecheck`: Mandatory zero-tolerance for type errors.
- `pnpm test`: Mandatory 100% pass rate before merge.
- `pnpm biome check .`: Enforcement of Clean Code and formatting standards.
