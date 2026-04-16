import { Account, Client, Storage, TablesDB } from 'node-appwrite';
import { AppwriteCatastrophicConfigError } from './errors/appwrite-errors.js';

export interface AppwriteClientConfig {
  endpoint: string;
  projectId: string;
  apiKey?: string;
}

interface AppwriteRuntime {
  client: Client;
  account: Account;
  tables: TablesDB;
  storage: Storage;
}

let runtime: AppwriteRuntime | null = null;

export function initializeAppwrite(config: AppwriteClientConfig): void {
  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

  if (config.apiKey) {
    client.setKey(config.apiKey);
  }

  runtime = {
    client,
    account: new Account(client),
    tables: new TablesDB(client),
    storage: new Storage(client),
  };
}

export function getTablesClient(): TablesDB {
  if (!runtime) {
    throw new AppwriteCatastrophicConfigError(
      'Appwrite is not initialized. Call initializeAppwrite first.',
    );
  }

  return runtime.tables;
}

export function getAccountClient(): Account {
  if (!runtime) {
    throw new AppwriteCatastrophicConfigError(
      'Appwrite is not initialized. Call initializeAppwrite first.',
    );
  }

  return runtime.account;
}

export function getStorageClient(): Storage {
  if (!runtime) {
    throw new AppwriteCatastrophicConfigError(
      'Appwrite is not initialized. Call initializeAppwrite first.',
    );
  }

  return runtime.storage;
}
