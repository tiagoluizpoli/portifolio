import { Query } from 'node-appwrite';
import { describe, expect, it } from 'vitest';
import { getTablesClient, initializeAppwrite } from '../client.js';

const APPWRITE_ENDPOINT_IT = process.env.APPWRITE_ENDPOINT_IT;
const APPWRITE_PROJECT_ID_IT = process.env.APPWRITE_PROJECT_ID_IT;
const APPWRITE_API_KEY_IT = process.env.APPWRITE_API_KEY_IT;
const APPWRITE_DATABASE_ID_IT = process.env.APPWRITE_DATABASE_ID_IT;
const APPWRITE_TABLE_ID_IT = process.env.APPWRITE_TABLE_ID_IT;

const hasIntegrationEnv =
  typeof APPWRITE_ENDPOINT_IT === 'string' &&
  typeof APPWRITE_PROJECT_ID_IT === 'string' &&
  typeof APPWRITE_API_KEY_IT === 'string' &&
  typeof APPWRITE_DATABASE_ID_IT === 'string' &&
  typeof APPWRITE_TABLE_ID_IT === 'string';

const describeLive = hasIntegrationEnv ? describe : describe.skip;

function getRequiredIntegrationEnv() {
  if (!hasIntegrationEnv) {
    throw new Error('Integration environment variables are not configured.');
  }

  return {
    endpoint: APPWRITE_ENDPOINT_IT,
    projectId: APPWRITE_PROJECT_ID_IT,
    apiKey: APPWRITE_API_KEY_IT,
    databaseId: APPWRITE_DATABASE_ID_IT,
    tableId: APPWRITE_TABLE_ID_IT,
  };
}

describeLive('Appwrite live integration', () => {
  it('connects with admin key and queries the integration table', async () => {
    const env = getRequiredIntegrationEnv();

    initializeAppwrite({
      endpoint: env.endpoint,
      projectId: env.projectId,
      apiKey: env.apiKey,
    });

    const tables = getTablesClient();
    const response = await tables.listRows({
      databaseId: env.databaseId,
      tableId: env.tableId,
      queries: [Query.limit(1)],
    });

    expect(response).toHaveProperty('total');
    expect(Array.isArray(response.rows)).toBe(true);
  });
});
