# Testing Prompt Examples — Quality Assurance Transformations

---

## Example 1: Unit Test

### User Input
> "add tests for the metrics schema"

### Enhanced Output

```markdown
# Unit Test Metrics Schema — Zod Validation Coverage

## Context
The metrics Zod schema needs comprehensive unit tests to validate all
constraints, edge cases, and error messages.

## Specialists Engaged
- **test-backend**: Vitest patterns, schema assertion strategies

## Technical Requirements
1. Test file: `__tests__/schemas/metrics.test.ts`.
2. Test cases:
   - ✅ Valid: All required fields present, correct types.
   - ✅ Valid: Optional fields omitted.
   - ❌ Invalid: Missing required field `label`.
   - ❌ Invalid: `label` starts with number (regex check).
   - ❌ Invalid: `value` is negative.
   - ❌ Invalid: `icon` is empty string.
   - ❌ Invalid: Extra unexpected fields.
3. Verify error messages are user-friendly.
4. Use `safeParse` for error inspection.

## Scope
- **WILL change**: New test file only
- **MUST NOT change**: Schema itself, any component code

## Success Criteria
- [ ] 100% branch coverage on metrics schema
- [ ] All edge cases tested
- [ ] Error messages verified
- [ ] `pnpm test` passes
- [ ] `pnpm guard` passes

## Governance
- Use `describe` + `it` blocks with descriptive names
- No `expect(x).toBeTruthy()` — use specific assertions
- Test behavior, not implementation
```

---

## Example 2: Component Integration Test

### User Input
> "test the about form submission"

### Enhanced Output

```markdown
# Integration Test About Form — Submit Flow Verification

## Context
The About form submission flow needs integration testing: fill fields → submit →
verify API call → verify success state.

## Specialists Engaged
- **test-frontend**: React Testing Library, user-event, mock setup
- **react-architect**: Form testing patterns, provider mocking

## Technical Requirements
1. Test file: `__tests__/components/about-form.test.tsx`.
2. Mock: Appwrite SDK calls (no real API in tests).
3. Test cases:
   - Fill all required fields → submit → verify mutation called with correct data.
   - Submit with empty required field → verify error message displays.
   - Submit while already submitting → verify button disabled.
   - Successful save → verify form resets dirty state.
   - Failed save → verify error toast appears.
4. Use `userEvent` for realistic interactions (not `fireEvent`).
5. Wrap component in all required providers (Form, Query, Toast).

## Scope
- **WILL change**: New test file only
- **MUST NOT change**: Form component, API layer

## Success Criteria
- [ ] All 5 test cases pass
- [ ] Mocks properly isolate from Appwrite
- [ ] User interactions use `userEvent`
- [ ] `pnpm test` passes

## Governance
- Test user behavior, not implementation details
- Use userEvent, not fireEvent
- Mock at the API boundary, not at component level
```

---

## Example 3: E2E Test

### User Input
> "add e2e test for the login flow"

### Enhanced Output

```markdown
# E2E Test Login Flow — Full User Journey Verification

## Context
The login flow needs end-to-end testing: navigate to login → enter credentials →
submit → verify redirect to dashboard.

## Specialists Engaged
- **test-e2e**: Playwright patterns, page objects, fixtures

## Technical Requirements
1. Test file: `e2e/auth/login.spec.ts`.
2. Page Object: `e2e/pages/login.page.ts` — encapsulate selectors.
3. Test cases:
   - Happy path: Valid credentials → redirect to `/dashboard`.
   - Invalid email: Error message "Invalid email format".
   - Wrong password: Error message "Invalid credentials".
   - Empty fields: Validation errors on both fields.
   - Session persistence: Login → close tab → reopen → still authenticated.
4. Use test fixtures for authenticated/unauthenticated states.
5. Clean up test data after each test.

## Scope
- **WILL change**: New test files and page objects
- **MUST NOT change**: Any application code

## Success Criteria
- [ ] All 5 test cases pass in CI
- [ ] Tests are independent (no shared state)
- [ ] Page objects encapsulate all selectors
- [ ] Clean up works reliably
- [ ] `pnpm test:e2e` passes

## Governance
- Page Object Pattern for all page interactions
- Independent tests (no shared state)
- Fixtures for common setup
- Cleanup after each test
```

---

## Example 4: Coverage Report

### User Input
> "check our test coverage"

### Enhanced Output

```markdown
# Analyze Test Coverage — Quality Gate Enforcement

## Context
Need to assess current test coverage and identify gaps, particularly in
newly added features and critical paths.

## Specialists Engaged
- **test-coverage**: Coverage analysis, threshold enforcement, reporting

## Technical Requirements
1. Run: `pnpm test:coverage` with Vitest c8/istanbul reporter.
2. Generate: HTML report + terminal summary.
3. Thresholds:
   - Statements: ≥ 80%
   - Branches: ≥ 75%
   - Functions: ≥ 80%
   - Lines: ≥ 80%
4. Identify: Files with < 50% coverage (critical gaps).
5. Prioritize: Domain models and server functions over UI components.

## Scope
- **WILL change**: Coverage configuration (if thresholds missing)
- **MUST NOT change**: Any application code

## Success Criteria
- [ ] Coverage report generated successfully
- [ ] All thresholds met or gaps documented
- [ ] Critical files (schemas, server functions) ≥ 90%
- [ ] Report saved to `coverage/` directory

## Governance
- Coverage is a quality gate, not a target
- Prioritize meaningful coverage over line count
- No lowering thresholds to pass
```
