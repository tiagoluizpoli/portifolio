// ---------------------------------------------------------------------------
// Client-Safe Exports (Shared Types, Schemas, and Domain Models)
// This file must NOT import or export anything that depends on 'node-appwrite'
// or other server-only Node.js libraries.
// ---------------------------------------------------------------------------

// Domain & Interfaces
export * from './domain/index.js';
// Schemas & Types
export type { AppwriteEnv } from './infrastructure/appwrite.client.js';
export {
  appwriteEnvSchema,
  validateAppwriteEnv,
} from './infrastructure/env.validator.js';
export {
  type CreatePortfolioItemPayload,
  createPortfolioItemSchema,
  type DeletePortfolioItemPayload,
  deletePortfolioItemSchema,
  type GetAssetPreviewPayload,
  type GetPortfolioRecordPayload,
  getAssetPreviewSchema,
  getPortfolioRecordSchema,
  type SearchIconsPayload,
  searchIconsSchema,
  type UpdatePortfolioItemPayload,
  type UploadAssetPayload,
  updatePortfolioItemSchema,
  uploadAssetSchema,
} from './models/portfolio.schemas.js';
// Transaction Types
export type {
  CompensatingAction,
  CompensatingActionStatus,
  ITransactionManager,
} from './transactions/transaction-manager.js';
