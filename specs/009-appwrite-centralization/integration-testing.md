# Appwrite Live Integration Testing Strategy

This document defines how to run real Appwrite integration tests safely without blocking regular PR velocity.

## Goal

- Keep fast checks required for every PR.
- Run live Appwrite integration tests only when dedicated integration secrets are available.
- Never run integration tests against production Appwrite projects.

## Dedicated Appwrite Project

Create one Appwrite project reserved for integration testing only.

Recommended resources:
- One dedicated database for IT (`integration_db`).
- One dedicated table for smoke/read checks (`integration_health`).
- Optional dedicated test buckets if storage scenarios are added later.

## Required CI Secrets

Set these repository secrets in GitHub:

- `APPWRITE_ENDPOINT_IT`
- `APPWRITE_PROJECT_ID_IT`
- `APPWRITE_API_KEY_IT`
- `APPWRITE_DATABASE_ID_IT`
- `APPWRITE_TABLE_ID_IT`

The `*_IT` suffix is mandatory to keep test credentials clearly separated from runtime/staging/production credentials.

## CI Behavior

Workflow split:
- `test-fast`: lint + typecheck + unit/contract tests (always required).
- `integration-live`: real Appwrite integration tests (secret-gated).

Policy recommendation:
- Pull Requests: require only `test-fast`.
- Main/Release: require `test-fast` and enable `integration-live` where secrets are available.
- Fork PRs: `integration-live` may be skipped due to secret unavailability.

## Local Execution

From repo root:

```bash
pnpm --filter @repo/appwrite test:integration
```

The current live test (`src/integration/appwrite-live.integration.spec.ts`) performs a safe read smoke-check (`listRows(limit(1))`) against the integration database/table.

## Safety Rules

- Do not point `*_IT` secrets to staging/prod projects.
- Use least-privilege API keys when possible.
- Keep integration test data namespaced and disposable.
- Prefer idempotent reads/smoke checks as baseline; add write/delete tests only with deterministic cleanup.
