import { type Databases, Query } from 'node-appwrite';

/**
 * AppwriteExceptionMapper (Constitution §III)
 * Standardizes Appwrite errors into a unified application domain model.
 */
export const mapAppwriteError = (error: unknown): Error => {
  const err = error as { code?: number; message?: string };
  const code = err?.code || 500;
  const message = err?.message || 'An unexpected Appwrite error occurred';

  switch (code) {
    case 401:
      return new Error(`Authentication Required: ${message}`);
    case 403:
      return new Error(`Permission Denied: ${message}`);
    case 404:
      return new Error(`Resource Not Found: ${message}`);
    default:
      return new Error(`Appwrite Error [${code}]: ${message}`);
  }
};

/**
 * SystemConfig Repository (Constitution §II, §XV)
 * Manages persistence for the 'config' collection using object-parameter style.
 * Centralized in @repo/appwrite-core for multi-app consistency.
 */
const CONFIG_COLLECTION_ID = 'config';

export const getSystemConfig = async (
  databases: Databases,
  databaseId: string,
) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      CONFIG_COLLECTION_ID,
      [Query.limit(1)],
    );
    return response.documents[0] || null;
  } catch (error) {
    throw mapAppwriteError(error);
  }
};

export const updateSystemConfig = async (
  databases: Databases,
  databaseId: string,
  documentId: string,
  data: Record<string, unknown>,
) => {
  try {
    return await databases.updateDocument(
      databaseId,
      CONFIG_COLLECTION_ID,
      documentId,
      data,
    );
  } catch (error) {
    throw mapAppwriteError(error);
  }
};
