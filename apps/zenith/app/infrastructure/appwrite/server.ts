/**
 * AppWrite Server Functions — FR-015: TransactionManager-wrapped RPCs.
 *
 * All multi-step mutation operations are wrapped in `TransactionManager.execute()`
 * to ensure LIFO compensating transactions if any step fails. Single-step reads
 * use the shared payload schemas from `@repo/appwrite-core` for consistency.
 *
 * Security: All functions in this file execute exclusively server-side via
 * `createServerFn`. Client code cannot access rollback logic or env credentials.
 */
import {
  createPortfolioItemSchema,
  getPortfolioRecordSchema,
  getTransactionManager,
  PortfolioService,
} from '@repo/appwrite-core';
import { createServerFn } from '@tanstack/react-start';
import { env } from '@/config/env';

// ---------------------------------------------------------------------------
// Service initialization (one instance per module load)
// ---------------------------------------------------------------------------
PortfolioService.init(env);

const portfolioService = new PortfolioService(
  env.APPWRITE_PROJECT_ID,
  env.APPWRITE_DATABASE_ID,
);

// ---------------------------------------------------------------------------
// Queries (read-only — no transaction needed)
// ---------------------------------------------------------------------------

export const getAppWriteData = createServerFn({ method: 'GET' }).handler(
  async (payload) => {
    const { data } = getPortfolioRecordSchema.parse(payload);
    return await portfolioService.getPortfolioRecord(data.documentId);
  },
);

export const testSecretIsolation = createServerFn({ method: 'GET' }).handler(
  async () => {
    return {
      hasKey: !!env.APPWRITE_API_KEY,
      message: 'Isolation Test',
    };
  },
);

// ---------------------------------------------------------------------------
// Mutations (wrapped in TransactionManager for LIFO rollback)
// ---------------------------------------------------------------------------

export const createPortfolioItem = createServerFn({ method: 'POST' }).handler(
  async (payload) => {
    const { data } = createPortfolioItemSchema.parse(payload);
    const tm = getTransactionManager();

    return await tm.execute(async (tx) => {
      const item = await portfolioService.createPortfolioItem(data);

      // TODO(FR-015): Register rollback once PortfolioService exposes deletePortfolioItem().
      // tx.push({
      //   id: `delete-portfolio-item-${item.$id}`,
      //   rollback: async () => portfolioService.deletePortfolioItem(item.$id),
      // });
      // When a second cross-service step is added (e.g. webhook notification),
      // add its tx.push() here and the LIFO stack will auto-compensate on failure.
      void tx;

      return item;
    });
  },
);
