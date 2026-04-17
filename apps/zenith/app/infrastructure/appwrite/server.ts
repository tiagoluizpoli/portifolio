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

import { Buffer } from 'node:buffer';
import {
  createPortfolioItemSchema,
  getAssetPreviewSchema,
  getPortfolioRecordSchema,
  searchIconsSchema,
  uploadAssetSchema,
} from '@repo/appwrite-core';
import {
  getTransactionManager,
  PortfolioService,
} from '@repo/appwrite-core/server';
import { createServerFn } from '@tanstack/react-start';
import { bootstrapAppwriteRuntime } from './bootstrap.js';

// ---------------------------------------------------------------------------
// Lazy Service Initialization (Singleton)
// ---------------------------------------------------------------------------
let serviceInstance: PortfolioService | null = null;

/**
 * Gets the singleton PortfolioService instance, initializing it on the first call.
 * This ensures that side effects and Node-only imports are only triggered
 * when a server function is actually executed.
 */
function getPortfolioService() {
  if (!serviceInstance) {
    const env = bootstrapAppwriteRuntime();

    // Top-level side effects are moved here to prevent leakage into the client bundle
    PortfolioService.init(env);
    serviceInstance = new PortfolioService(
      env.APPWRITE_PROJECT_ID,
      env.APPWRITE_DATABASE_ID,
    );
  }
  return serviceInstance;
}

// ---------------------------------------------------------------------------
// Queries (read-only — no transaction needed)
// ---------------------------------------------------------------------------

export const getAppWriteData = createServerFn({ method: 'GET' }).handler(
  async ({ data: payload }) => {
    const { data } = getPortfolioRecordSchema.parse({ data: payload });
    const service = getPortfolioService();
    return await service.getPortfolioRecord(data.documentId);
  },
);

export const testSecretIsolation = createServerFn({ method: 'GET' }).handler(
  async () => {
    const env = bootstrapAppwriteRuntime();

    return {
      hasKey: !!env.APPWRITE_API_KEY,
      message: 'Isolation Test',
    };
  },
);

export const searchIcons = createServerFn({ method: 'GET' }).handler(
  async ({ data: payload }) => {
    try {
      // Validate that we have the direct payload from the server function call
      const { data: query } = searchIconsSchema.parse({ data: payload });
      if (!query || query.length < 2) return { icons: [] };

      const response = await fetch(
        `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=32`,
      );

      if (!response.ok) {
        throw new Error(`Iconify API responded with status ${response.status}`);
      }

      const data = await response.json();
      return {
        icons: data.icons || [],
        total: data.total || 0,
      };
    } catch (error) {
      console.error('[Icon Search Error]:', error);
      // Return a stable object rather than throwing to avoid 500s where possible
      return {
        icons: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown search error',
      };
    }
  },
);

// ---------------------------------------------------------------------------
// Mutations (wrapped in TransactionManager for LIFO rollback)
// ---------------------------------------------------------------------------

export const createPortfolioItem = createServerFn({ method: 'POST' }).handler(
  async ({ data: payload }) => {
    const { data } = createPortfolioItemSchema.parse({ data: payload });
    const tm = getTransactionManager();
    const service = getPortfolioService();

    return await tm.execute(async (tx) => {
      const item = await service.createPortfolioItem(data);

      // TODO(FR-015): Register rollback once PortfolioService exposes deletePortfolioItem().
      // tx.push({
      //   id: `delete-portfolio-item-${item.$id}`,
      //   rollback: async () => service.deletePortfolioItem(item.$id),
      // });
      // When a second cross-service step is added (e.g. webhook notification),
      // add its tx.push() here and the LIFO stack will auto-compensate on failure.
      void tx;

      return item;
    });
  },
);

export const uploadAsset = createServerFn({ method: 'POST' }).handler(
  async ({ data: payload }) => {
    const { data } = uploadAssetSchema.parse({ data: payload });
    const buffer = Buffer.from(data.file, 'base64');
    const service = getPortfolioService();
    return await service.uploadAsset(
      data.bucketId,
      buffer,
      data.fileName,
      data.fileId,
    );
  },
);

export const getAssetPreview = createServerFn({ method: 'GET' }).handler(
  async ({ data: payload }) => {
    try {
      const { data } = getAssetPreviewSchema.parse({ data: payload });
      const service = getPortfolioService();
      const url = await service.getAssetPreview(data.bucketId, data.fileId);
      return { url: url.toString() };
    } catch (error) {
      console.error('[Appwrite Storage] Failed to resolve preview:', error);
      // Return null URL to allow the frontend to gracefully show the "Select Asset" state
      // instead of crashing the entire server route.
      return { url: null };
    }
  },
);

export const getAssetView = createServerFn({ method: 'GET' }).handler(
  async ({ data: payload }) => {
    try {
      const { data } = getAssetPreviewSchema.parse({ data: payload });
      const service = getPortfolioService();
      const url = await service.getAssetView(data.bucketId, data.fileId);
      return { url: url.toString() };
    } catch (error) {
      console.error('[Appwrite Storage] Failed to resolve view:', error);
      return { url: null };
    }
  },
);

export const getAssetInfo = createServerFn({ method: 'GET' }).handler(
  async ({ data: payload }) => {
    try {
      const { data } = getAssetPreviewSchema.parse({ data: payload });
      const service = getPortfolioService();
      const asset = await service.getAssetInfo(data.bucketId, data.fileId);
      return { asset };
    } catch (error) {
      console.error('[Appwrite Storage] Failed to resolve file info:', error);
      return { asset: null };
    }
  },
);
