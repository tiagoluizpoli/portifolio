# /review Command

This command triggers a comprehensive **Code Review** using the `code-review` Skill. It assumes the persona of a principal engineer specialized in the relevant stack and validates the code against the active specification in the `specs/` directory.

## Execution Pattern

1. **Trigger**: Invoke `@[/review]` or `/review <target>`. `target` can be a file, a directory, or empty (to review recent unstaged/staged changes).
2. **Strategy**:
    - **Context Gathering**: Evaluate the target code changes using your `Read` tools. Actively identify the feature or specification folder in `specs/`. If uncertain, prompt the user.
    - **Spec Alignment**: Read `spec.md`, `plan.md`, and any checklists in the relevant `specs/` directory.
    - **Analysis**: Cross-reference the implementation with the functional requirements and architecture directives.
    - **Review Output**: Output a structured, expert-level code review focusing on performance, security, idioms, and adherence to the plan.

## Rules
- **No Compromises**: Hold the code to the highest industry standards for the identified tech stack.
- **Spec-Driven**: Ensure the code satisfies the "spec kit" requirements. Highlight any code that works but deviates from `plan.md` or `spec.md`.
- **Constructive Guidance**: Provide concrete code snippets, architectural improvements, and actionable steps instead of just pointing out errors.

## Metadata
- **Scope**: codebase
- **Skill**: code-review
