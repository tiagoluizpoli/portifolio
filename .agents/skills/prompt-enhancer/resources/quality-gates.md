# Quality Gates — Enhanced Prompt Validation

## Pre-Delivery Checklist

Run this checklist before delivering ANY enhanced prompt.

### Universal Checks (ALL prompts)

| # | Check | Pass Condition |
|:---|:---|:---|
| 1 | Domain classified | At least one domain identified |
| 2 | Specialists engaged | At least one specialist listed |
| 3 | Core governance injected | Block A present |
| 4 | Scope defined | Both "WILL change" and "MUST NOT change" present |
| 5 | Success criteria present | At least one measurable criterion |
| 6 | No ambiguous language | Zero instances of "maybe", "possibly", "if needed", "could" |
| 7 | Title is intent-based | Title describes WHAT we're achieving, not HOW |
| 8 | Context provided | WHY we're doing this is stated |

### UI-Specific Checks (UI/frontend prompts)

| # | Check | Pass Condition |
|:---|:---|:---|
| 9 | UI Red Flag Protocol | Block B injected |
| 10 | Aesthetic standards | Block C injected |
| 11 | Color tokens specified | All colors use HSL/OKLCH, not hex |
| 12 | Spacing uses grid | All spacing values are 4px multiples |
| 13 | Motion type specified | Spring configs or explicit "no animation" |
| 14 | A11y requirements | APCA contrast levels stated |
| 15 | Reduced motion | Fallback mentioned |

### Backend-Specific Checks

| # | Check | Pass Condition |
|:---|:---|:---|
| 16 | SDK version stated | "v22.1.3" or specific version |
| 17 | Permission model | Document-level permissions specified |
| 18 | Zod validation | Input validation requirement stated |
| 19 | Error handling | AppwriteException pattern required |

### Architecture-Specific Checks

| # | Check | Pass Condition |
|:---|:---|:---|
| 20 | 300-line limit | Component size constraint mentioned |
| 21 | Pattern specified | Which React/arch pattern to use |
| 22 | Named exports | No-default-export rule stated |
| 23 | Type safety | No-any rule stated |

### Testing-Specific Checks

| # | Check | Pass Condition |
|:---|:---|:---|
| 24 | Test framework | Vitest/RTL/Playwright specified |
| 25 | Mocking strategy | What to mock, what's real |
| 26 | Coverage target | Minimum % stated |
| 27 | Assertion quality | Specific assertion types required |

---

## Red Flags — Auto-Reject Conditions

If ANY of these are true, the enhanced prompt MUST be rejected and reworked:

1. **No scope definition** — Prompt doesn't say what will and won't change
2. **Implicit UI changes** — Visual changes not explicitly called out
3. **Missing governance** — Core governance block absent
4. **Vague success criteria** — "It should work" instead of measurable criteria
5. **Wrong specialists** — Frontend task without `frontend-specialist`
6. **Arbitrary values** — Hardcoded px/hex without token justification
7. **Scope expansion** — Enhanced prompt adds work the user didn't request
8. **Missing context** — No explanation of WHY we're doing this
