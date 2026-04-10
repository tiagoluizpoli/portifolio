# Quickstart: Zenith CMS Refinement

Integration guide for Feature 008.

## Round-Based Execution
This feature is implemented in isolated **Verification Rounds**:
1. **Infra**: Domain models & Appwrite schema (EN-source migration).
2. **Global**: Routing prefix & Sidebar branding.
3. **Features**: Skills/Solutions Card Grid, Metrics Dialog Sync, Home Split Layout.
4. **Platforms**: Side-drawer CRUD.

## Key Component Patterns

### CmsSaveButton
Universal save button to be used in all CMS forms.
```tsx
import { CmsSaveButton } from '@/features/cms/components/common/CmsSaveButton';

// Usage
<CmsSaveButton 
  isDirty={form.isDirty} 
  isPending={mutation.isPending} 
  onClick={() => form.handleSubmit()} 
/>
```

### TanStack Form v12+
All CMS forms MUST use the refined TanStack Form structure. if code > 300 lines, use the Composite pattern.

## Local Development
1. Run `apps/migrator` to update the schema.
2. Ensure `PORTFOLIO_CMS_PREFIX` is set in environment if applicable.
3. Run `pnpm zenith dev`.
