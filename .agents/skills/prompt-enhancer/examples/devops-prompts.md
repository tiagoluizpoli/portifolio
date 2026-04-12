# DevOps Prompt Examples — Git & CI Transformations

---

## Example 1: Commit Message

### User Input
> "commit my changes"

### Enhanced Output

```markdown
# Semantic Commit — Granular Logical Intent

## Context
Changes need to be committed following the project's semantic commit workflow
with proper categorization and safety checks.

## Specialists Engaged
- **git-commit**: Semantic commit workflow, safety-stash, quality gates

## Requirements
1. Run `pnpm guard` before committing (quality gate).
2. Analyze changes with `git diff --staged` to determine commit type.
3. Commit types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`.
4. Format: `type(scope): description`
5. If changes span multiple scopes, create multiple granular commits.

## Examples
- `feat(about): add resume upload component`
- `fix(metrics): resolve save button disabled state`
- `refactor(sidebar): extract state to SidebarProvider`
- `style(dashboard): apply staggered entrance animation`
- `test(schemas): add metrics schema validation tests`

## Success Criteria
- [ ] `pnpm guard` passes before commit
- [ ] Commit message follows semantic format
- [ ] One logical change per commit
- [ ] No unrelated changes bundled

## Governance
- Quality gate MUST pass before commit
- One logical intent per commit
- No "wip" or "misc" commits
```

---

## Example 2: CI Pipeline

### User Input
> "set up CI for the project"

### Enhanced Output

```markdown
# Configure CI Pipeline — GitHub Actions Quality Gate

## Context
Need automated CI pipeline that runs quality checks on every push and PR
to enforce project architecture standards.

## Specialists Engaged
- **git-commit**: Quality gate commands
- **code-review**: Standards to enforce

## Technical Requirements
1. **Trigger**: On push to `main`, on PR to `main`.
2. **Jobs**:
   - `lint`: Run `pnpm lint` (Biome)
   - `typecheck`: Run `pnpm typecheck` (tsc --noEmit)
   - `test`: Run `pnpm test` (Vitest)
   - `guard`: Run `pnpm guard` (combined quality gate)
3. **Node version**: 20.x
4. **Package manager**: pnpm 9.x
5. **Caching**: Cache `node_modules` and pnpm store.

## Scope
- **WILL change**: New `.github/workflows/ci.yml`
- **MUST NOT change**: Any application code

## Success Criteria
- [ ] Pipeline runs on every push/PR
- [ ] All quality gates enforced
- [ ] Build fails if any check fails
- [ ] Caching reduces install time
- [ ] Badge added to README

## Governance
- Guard must pass = all checks pass
- No skipping checks
- No manual overrides
```

---

## Example 3: Deployment

### User Input
> "deploy the portfolio"

### Enhanced Output

```markdown
# Deploy Application — Production Build & Release

## Context
Application needs deployment. Must verify quality gates pass, build production
bundle, and deploy to hosting platform.

## Specialists Engaged
- **git-commit**: Pre-deploy quality verification
- **tanstack-master**: Production build configuration

## Technical Requirements
1. **Pre-deploy checks**: `pnpm guard` must pass.
2. **Build**: `pnpm build` — production bundle with optimizations.
3. **Verify**: Check build output for errors/warnings.
4. **Deploy**: Deploy to configured hosting platform.
5. **Post-deploy**: Verify production site loads correctly.

## Scope
- **WILL change**: Production build output, deployment target
- **MUST NOT change**: Source code, configuration

## Success Criteria
- [ ] `pnpm guard` passes
- [ ] Production build succeeds with zero warnings
- [ ] Deployed site loads correctly
- [ ] All routes accessible
- [ ] Performance acceptable (LCP < 2.5s)

## Governance
- Never deploy without passing quality gate
- Test production build locally before deploying
- Tag release with semantic version
```
