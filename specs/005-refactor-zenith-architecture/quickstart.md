# Quickstart: Zenith Architecture Refactor

## Booting testing environment

To verify the **Catastrophic Startup Validation** (FR-011):
1. Rename or comment out `APPWRITE_API_KEY` in `apps/zenith/.env`
2. Run `pnpm dev` inside `apps/zenith`
3. Navigate to `http://localhost:5173`
4. **Expected**: A static HTML screen appears clearly listing `APPWRITE_API_KEY` as missing, without the Node.js server crashing.
5. Restore `.env` and verify normal booting.

## Using the Transaction Manager

To wrap multiple operations in a reliable state boundary (FR-015):

```typescript
import { getTransactionManager } from '@repo/appwrite-core';

export const complexServerFn = createServerFn({ method: "POST" }).handler(async (payload) => {
  const tm = getTransactionManager();
  
  return await tm.execute(async (tx) => {
      const step1 = await portfolioService.createItem(payload.data);
      tx.push({
         id: "step1-rollback",
         rollback: async () => await portfolioService.deleteItem(step1.id)
      });
      
      const step2 = await externalService.someAction(step1.id);
      return step2;
      // If step2 throws, tx automatically triggers the rollback for step1!
  });
});
```
