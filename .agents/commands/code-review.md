---
description: Triggers a comprehensive Code Review using the code-review Skill against the active specification in the specs/ directory.
---

# /code.review Command

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). It usually specifies the target file(s) or directory to review.

## Goal

Perform a comprehensive code review assuming the role of a principal engineer. Validate code against the highest industry standards, clean code practices (SOLID), and the active feature's specification constraints (`spec.md` and `plan.md`).

## Operating Constraints

- **No Compromises**: Hold the code strictly to the industry standards of the identified tech stack.
- **Spec-Driven**: Ensure code satisfies "spec kit" requirements. Output failures when code deviates from the plan/spec architecture.
- **Constructive Guidance**: Must provide actionable steps, including code snippets and architectural improvements.

## Execution Steps

### 1. Identify Context
Use `$ARGUMENTS` or your Read tools on `git status` to locate the files under review. Match them to the active/relevant feature directory inside `specs/`.

### 2. Spec Alignment
Load `spec.md`, `plan.md`, and any checklists from the assigned `specs/` directory to derive current requirements and technical constraints.

### 3. Deep Analysis
Evaluate the target code changes using the capabilities defined in the `code-review` Skill. Focus on performance, security, SOLID principles, code smells, and alignment with the specifications.

### 4. Review Output
Emit a structured code review outlining Spec Alignment, Critical Findings, Nitpicks & Best Practices, and Suggested Changes. Provide concrete patches or snippets for identified issues.

## Context

$ARGUMENTS
