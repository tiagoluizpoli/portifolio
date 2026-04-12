# Enhancement Pipeline — Step-by-Step Decision Tree

## Phase 1: Input Analysis

```
User Request Received
        │
        ▼
┌─────────────────┐
│ Is it a simple   │──YES──▶ Quick Enhancement Mode
│ one-liner?       │         (no specialist routing needed)
└────────┬────────┘
         │ NO
         ▼
┌─────────────────┐
│ Does it touch    │──YES──▶ UI Enhancement Mode
│ any UI/visual?   │         (engage Frontend Squad + UI Red Flag)
└────────┬────────┘
         │ NO
         ▼
┌─────────────────┐
│ Is it backend/   │──YES──▶ Infrastructure Enhancement Mode
│ infrastructure?  │         (engage Appwrite + schema validation)
└────────┬────────┘
         │ NO
         ▼
┌─────────────────┐
│ Is it testing/   │──YES──▶ Testing Enhancement Mode
│ quality?         │         (engage test specialists + coverage gates)
└────────┬────────┘
         │ NO
         ▼
  Full Enhancement Mode
  (engage all relevant specialists)
```

## Phase 2: Enhancement Modes

### Quick Enhancement Mode
For trivial requests (typo fix, add comment, run command):
- No specialist routing
- No governance injection
- Just clarify intent and deliver

**Example**: "fix the typo" → "Fix the typo in [specific file/location]. No other changes."

### UI Enhancement Mode
For anything touching visuals:
1. Engage: `frontend-specialist`, `react-architect`, `tailwind-architect`, `shadcn-specialist`
2. Inject: UI Red Flag Protocol, 4px grid, HSL colors, spring physics
3. Define: Exact scope of visual changes
4. Include: Aesthetic standards block

### Infrastructure Enhancement Mode
For backend/data operations:
1. Engage: `appwrite`, `tanstack-master`
2. Inject: Schema validation, permission model, error handling
3. Define: Migration strategy, rollback plan
4. Include: Data integrity constraints

### Testing Enhancement Mode
For test-related requests:
1. Engage: `test-backend` / `test-frontend` / `test-e2e` / `test-coverage`
2. Inject: Coverage thresholds, assertion patterns
3. Define: What to test, what to mock, what's the boundary
4. Include: Quality gate pass criteria

### Full Enhancement Mode
For complex, multi-domain requests:
1. Engage: ALL relevant specialists
2. Inject: ALL governance blocks
3. Define: Scope boundaries per domain
4. Include: Dependency order between domains

---

## Phase 3: Output Assembly

### Brief Template

```markdown
# [Intent-Based Title]

## Context
[2-3 sentences: Why are we doing this? What problem does it solve?]

## Specialists Engaged
- **[Specialist A]**: [What it provides]
- **[Specialist B]**: [What it provides]

## Technical Requirements
1. [Requirement with specific API/library/version]
2. [Requirement with specific constraint]
3. [Requirement with specific pattern to use]

## Aesthetic Requirements (if UI)
- Colors: [Specific HSL tokens]
- Spacing: [Specific 4px grid values]
- Motion: [Specific spring config]
- A11y: [Specific APCA levels]

## Scope Definition
**WILL change**: [Exhaustive list]
**MUST NOT change**: [Exhaustive list]

## Success Criteria
- [ ] `pnpm guard` passes with zero warnings
- [ ] [Specific test passes]
- [ ] [Specific visual matches approved design]

## Governance
- 300-line component limit
- Named exports only
- Full type safety (no `any`)
- UI Red Flag Protocol active
```

---

## Phase 4: Validation Gate

Before delivering the enhanced prompt, verify:

| Check | Pass Condition |
|:---|:---|
| Domain classified? | At least one domain identified |
| Specialists routed? | At least one specialist engaged |
| Scope defined? | Both "WILL change" and "MUST NOT change" lists present |
| Governance injected? | At least the core governance block included |
| Success criteria measurable? | Each criterion can be verified programmatically |
| Ambiguity resolved? | No "maybe", "possibly", "if needed" language |
| UI Red Flag (if UI)? | Protocol explicitly included |
