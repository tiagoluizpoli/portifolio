# /commit Command

This command triggers the **Portfolio Semantic Commit** workflow, ensuring all changes are safety-stashed, quality-gated by the `pnpm guard` sentinel, and committed using granular logical intent.

## Execution Pattern

1. **Trigger**: Invoke `@[/commit]` or call this command manually.
2. **Strategy**: 
    - **Intent-Based Contexts**: Group changes by logical achievement (e.g., "satisfy guard sentinel", "consolidate agent context").
    - **Quality Sentinel**: Mandatory `pnpm guard` execution.
    - **Safety First**: Automatic stash creation and application before committing.

## Rules
- **Never Push**: commits must remain local.
- **Semantic messages**: use Conventional Commits.
- **Granularity**: split by logical achievement, not just files.

## Metadata
- **Scope**: portfolio
- **Baton**: git-commit
