---
name: git-commit
description: Triggers the Portfolio Semantic Commit workflow, ensuring changes are safety-stashed, quality-gated, and committed using granular logical intent.
allowed-tools:
  - "Read"
  - "Write"
  - "Bash"
---

# Git Commit Skill (Logical Intent Edition)

This skill automates the process of committing changes in the **Portfolio** monorepo while adhering to strict safety, semantic, and **Intent-Based** standards.

## Workflow

### 1. Pre-Execution Validation
- Verify there are changes using `git status --porcelain`.
- **CRITICAL**: Abort if no changes.

### 2. Safety Backup
- **Create Stash**: `git stash push -m "Safety backup: Portfolio Redo Sequence $(date +'%Y-%m-%d %H:%M:%S')"`
- **Restore Working State**: `git stash apply stash@{0}`.
- **CRITICAL**: Preserve existing stashes.

### 3. Quality Gating (Principle XII)
- Run `pnpm guard` from root.
- **Rules**:
    - Fails if `pnpm guard` returns non-zero.
    - Report specific diagnostics.

### 4. Intent-Based Grouping
Analyze achievements and group by logical context (**"What was achieved?"**).
Example groups:
- **`chore(agent): consolidate context`**: Migration of `.agent` -> `.agents`.
- **`feat(agent): commit engine`**: The new commit system.
- **`fix(zenith): data integrity`**: Service renames, React key stability.
- **`style(zenith): guard compliance`**: Accessibility (button type), unused imports, code hygiene.

### 5. Semantic Commit Execution
For each intent-based group:
- `git add <intent_related_files>`
- `git commit -m "<type>(<scope>): <logical_achievement>"`

### 6. NO PUSH POLICY
- Never execute `git push`.

### 7. Safety Cleanup Prompt
- Ask: **"Redo sequence complete. Safety stash created: `stash@{0}`. Drop or keep?"**
