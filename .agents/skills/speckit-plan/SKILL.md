---
name: speckit-plan
description: Generate technical implementation plans from feature specifications.
  Use after creating a spec to define architecture, tech stack, and implementation
  phases. Creates plan.md with detailed technical design.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: templates/commands/plan.md
---

# Speckit Plan Skill

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

22. ## UI RED FLAG PROTOCOL

You MUST strictly adhere to the UI Precision and Scope Enforcement principles of the project constitution. 

If you detect any UI change required that is outside the explicit scope of the initial request (even small tweaks to alignment, colors, or radius):
1. **STOP IMMEDIATELY**: Do not generate the plan or touch any code.
2. **GATHER RICH DETAILS**: 
   - State of the current UI.
   - Exact nature of the proposed change.
   - Anticipated impact on UX and token consistency.
3. **LOG THE DECISION**: Use `write_to_file` to append a new entry to `.specify/memory/ui-decision-log.md` FOLLOWING the established table format, including date/time, detailed description, and semantic tags.
4. **PROMPT THE USER**: Present the gathered information and the log entry to the user for definitive approval before resuming.

## Outline

**PROMPT ENHANCEMENT**: Before processing any arguments or starting the plan, you **MUST** invoke the `prompt-enhancer` protocol to transform the user's intent into a high-fidelity architectural brief. This will engage the **Frontend Specialist Squad** and mandate nanometer-level UI details.

1. **Setup**: Run `.specify/scripts/bash/setup-plan.sh --json` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load context**: Read FEATURE_SPEC and `.specify/memory/constitution.md`. Load IMPL_PLAN template (already copied). **MANDATORY**: Check for `tests/` directory in `FEATURE_DIR` and read any exhaustive test scenarios (`*.md`) for technical context.

3. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution
   - Evaluate gates (ERROR if violations unjustified)
   - Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Phase 1: Update agent context by running the agent script
   - Phase 2: Generate test-plan.md (Mandatory BE, FE, and E2E scenarios)
   - Re-evaluate Constitution Check post-design

4. **Stop and report**: Command ends after Phase 2 planning. Report branch, IMPL_PLAN path, and generated artifacts.

## Phases

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```text
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Define interface contracts** (if project has external interfaces) → `/contracts/`:
   - Identify what interfaces the project exposes to users or other systems
   - Document the contract format appropriate for the project type
   - Examples: public APIs for libraries, command schemas for CLI tools, endpoints for web services, grammars for parsers, UI contracts for applications
   - Skip if project is purely internal (build scripts, one-off tools, etc.)

3. **Agent context update**:
   - Run `.specify/scripts/bash/update-agent-context.sh agy`
   - These scripts detect which AI agent is in use
   - Update the appropriate agent-specific context file
   - Add only new technology from current plan
   - Preserve manual additions between markers

**Output**: data-model.md, /contracts/*, quickstart.md, agent-specific file

### Phase 2: Testing & Coverage Strategy

**Prerequisites:** Phase 1 complete

1. **Invoke Testing Specialists**: Call `test-coverage`, `test-backend`, `test-frontend`, and `test-e2e` to define the test architecture.

2. **Consolidate Scenarios**: For every Functional Requirement (FR) and User Story (US) in the spec → Define Backend and Frontend test cases. **PRIORITY**: If exhaustive scenarios exist in `tests/*.md`, they MUST be treated as the authoritative source for these definitions.
   - For every critical mission flow (Auth, Sync, Assets) → Define E2E journey test cases.

3. **Consolidate in `test-plan.md`**:
   - Mappings: FR-XXX -> [Test Case Name] -> [Expected Outcome].
   - Coverage: Define specific % targets for the current feature scope.
   - Guardrails: Define any custom `pnpm guard` checks needed.

**Output**: test-plan.md

## Key rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
