# Test Plan: Appwrite-Migrator Hardened Refactor

## Authoritative Testing (Constitution Principle XXI)
Automated tests are the authoritative source of truth for feature behavior. Tests ENFORCE correctness; they do not follow code.

## Coverage Strategy
- **Unit Tests**: 100% coverage for all decomposed service classes, CLI parsing logic, and domain mappers.
- **Integration Tests**: Verify command orchestration using Appwrite mocks.
- **E2E Tests**: Verify the `final-voyage` journey in a staging environment.

## Test Case Definitions

### [NEW] Domain Entity Validation (Exhaustive)
The `SeederValidator` must verify all 11 entities against their Zod schemas and API-level constraints:
- **TS-BE-001**: `about` - Verify string length and required fields.
- **TS-BE-002**: `home` - Verify landing page schema integrity.
- **TS-BE-003**: `contact_info` - Verify email formats and phone patterns.
- **TS-BE-004**: `socials` - Verify URL formats for platform links.
- **TS-BE-005**: `platforms` - Verify specialized platform metadata.
- **TS-BE-006**: `solutions` - Verify project/case-study schemas.
- **TS-BE-007**: `skills` - Verify categorization and level enums.
- **TS-BE-008**: `educations` - Verify date range logic and degree strings.
- **TS-BE-009**: `experiences` - Verify job descriptions and company URLs.
- **TS-BE-010**: `impact_metrics` - Verify numeric ranges and unit strings.
- **TS-BE-011**: `metric_sources` - Verify source attribution and verification links.

### Unit Tests
- `MigratorCli`: Verify flag parsing with `Commander` and validation with `cliConfigSchema`.
- `SeederValidator`: Verify row-level Zod parsing and Appwrite API length constraints.
- `SeederPlanner`: Verify unique signature calculation and upsert plan generation.
- `SeederExecutor`: Verify retry logic under rate-limit (429) simulation.
- `SchemaComparator`: Verify table/column/index diffing accuracy.

### E2E / Journey Tests
- `final-voyage`: The definitive user journey verifying `check -> migrate -> seed -> template`.

## Guardrails
- `pnpm guard`: Mandatory pass with zero lint/type/test errors.
- `Line Limit`: Verify all new service files are **< 300 lines**.
