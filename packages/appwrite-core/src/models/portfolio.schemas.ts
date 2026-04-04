/**
 * Shared Zod payload schemas for Portfolio mutation boundaries.
 *
 * FR-015: Centralizes validation schemas used across AppWrite server functions
 * to eliminate duplicated `z.object()` definitions in `infrastructure/appwrite/server.ts`.
 *
 * All schemas must be used server-side only (inside `createServerFn` handlers).
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Portfolio Item Schemas
// ---------------------------------------------------------------------------

/** Schema for fetching a single portfolio record by its document ID */
export const getPortfolioRecordSchema = z.object({
  data: z.object({
    collectionId: z.string().min(1, 'collectionId is required'),
    documentId: z.string().min(1, 'documentId is required'),
  }),
});

export type GetPortfolioRecordPayload = z.infer<
  typeof getPortfolioRecordSchema
>;

// ---------------------------------------------------------------------------

/** Schema for creating a new portfolio item */
export const createPortfolioItemSchema = z.object({
  data: z.object({
    title: z.string().min(1, 'title is required'),
    description: z.string().optional(),
  }),
});

export type CreatePortfolioItemPayload = z.infer<
  typeof createPortfolioItemSchema
>;

// ---------------------------------------------------------------------------

/** Schema for deleting a portfolio item */
export const deletePortfolioItemSchema = z.object({
  data: z.object({
    documentId: z.string().min(1, 'documentId is required'),
  }),
});

export type DeletePortfolioItemPayload = z.infer<
  typeof deletePortfolioItemSchema
>;

// ---------------------------------------------------------------------------

/** Schema for updating an existing portfolio item */
export const updatePortfolioItemSchema = z.object({
  data: z.object({
    documentId: z.string().min(1, 'documentId is required'),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
  }),
});

export type UpdatePortfolioItemPayload = z.infer<
  typeof updatePortfolioItemSchema
>;
