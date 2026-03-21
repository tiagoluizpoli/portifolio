import { Client, Databases, Role, Storage, TablesDB } from 'node-appwrite';
import type { AppwriteEnv } from './env.validator.js';

export type { AppwriteEnv };

// biome-ignore lint/complexity/noStaticOnlyClass: Utility class pattern for centralized Appwrite access
export class AppwriteProvider {
  public static client: Client;
  private static databases: Databases;
  private static storage: Storage;
  private static tablesDB: TablesDB;
  private static env: AppwriteEnv;

  public static initialize(config: AppwriteEnv) {
    AppwriteProvider.env = config;

    AppwriteProvider.client = new Client()
      .setEndpoint(AppwriteProvider.env.APPWRITE_ENDPOINT)
      .setProject(AppwriteProvider.env.APPWRITE_PROJECT_ID)
      .setKey(AppwriteProvider.env.APPWRITE_API_KEY);

    AppwriteProvider.databases = new Databases(AppwriteProvider.client);
    AppwriteProvider.storage = new Storage(AppwriteProvider.client);
    AppwriteProvider.tablesDB = new TablesDB(AppwriteProvider.client);
  }

  public static getDatabases(): Databases {
    if (!AppwriteProvider.databases)
      throw new Error('AppwriteProvider not initialized');
    return AppwriteProvider.databases;
  }

  public static getStorage(): Storage {
    if (!AppwriteProvider.storage)
      throw new Error('AppwriteProvider not initialized');
    return AppwriteProvider.storage;
  }

  public static getTablesDB(): TablesDB {
    if (!AppwriteProvider.tablesDB)
      throw new Error('AppwriteProvider not initialized');
    return AppwriteProvider.tablesDB;
  }

  public static getCuratorRole(): string {
    if (!AppwriteProvider.env)
      throw new Error('AppwriteProvider not initialized');
    return Role.team(AppwriteProvider.env.APPWRITE_CURATOR_TEAM_ID);
  }

  public static getEnv(): AppwriteEnv {
    if (!AppwriteProvider.env)
      throw new Error('AppwriteProvider not initialized');
    return AppwriteProvider.env;
  }
}
