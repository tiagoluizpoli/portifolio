import { Client, Databases, Role, Storage, TablesDB } from 'node-appwrite';
import { type AppwriteEnv, validateAppwriteEnv } from './env.validator';

// biome-ignore lint/complexity/noStaticOnlyClass: Utility class pattern for centralized Appwrite access
export class AppwriteProvider {
  private static client: Client;
  private static databases: Databases;
  private static tablesDB: TablesDB;
  private static storage: Storage;
  private static env: AppwriteEnv;

  static initialize(environment: Record<string, string | undefined>) {
    AppwriteProvider.env = validateAppwriteEnv(environment);

    AppwriteProvider.client = new Client()
      .setEndpoint(AppwriteProvider.env.APPWRITE_ENDPOINT)
      .setProject(AppwriteProvider.env.APPWRITE_PROJECT_ID)
      .setKey(AppwriteProvider.env.APPWRITE_API_KEY);

    AppwriteProvider.databases = new Databases(AppwriteProvider.client);
    AppwriteProvider.tablesDB = new TablesDB(AppwriteProvider.client); // Most modern API for 2026
    AppwriteProvider.storage = new Storage(AppwriteProvider.client);
  }

  static getDatabases(): Databases {
    if (!AppwriteProvider.databases)
      throw new Error('AppwriteProvider not initialized');
    return AppwriteProvider.databases;
  }

  static getTablesDB(): TablesDB {
    if (!AppwriteProvider.tablesDB)
      throw new Error('AppwriteProvider not initialized');
    return AppwriteProvider.tablesDB;
  }

  static getStorage(): Storage {
    if (!AppwriteProvider.storage)
      throw new Error('AppwriteProvider not initialized');
    return AppwriteProvider.storage;
  }

  static getCuratorRole(): string {
    if (!AppwriteProvider.env)
      throw new Error('AppwriteProvider not initialized');
    return Role.team(AppwriteProvider.env.APPWRITE_CURATOR_TEAM_ID);
  }

  static getEnv() {
    if (!AppwriteProvider.env)
      throw new Error('AppwriteProvider not initialized');
    return AppwriteProvider.env;
  }
}
