import { AppwriteProvider } from '@repo/appwrite-core';
import {
  IndexType,
  Permission,
  Role,
  type Storage,
  type TablesDB,
} from 'node-appwrite';

export class SchemaManager {
  private tables: TablesDB;
  private storage: Storage;
  private databaseId: string;

  constructor() {
    this.tables = AppwriteProvider.getTablesDB();
    this.storage = AppwriteProvider.getStorage();
    this.databaseId = AppwriteProvider.getEnv().APPWRITE_DATABASE_ID;
  }

  async run() {
    console.log('[DEBUG] Starting Schema Initialization');
    try {
      await this.ensureDatabase();
      await this.setupTables();
      await this.ensureBuckets();
      console.log('[DEBUG] Schema Initialization Complete');
    } catch (err) {
      console.error('[DEBUG] Schema Initialization FAILED:', err);
      throw err;
    }
  }

  private async ensureDatabase() {
    try {
      // In TablesDB, we still check/create the database container
      await this.tables.get({ databaseId: this.databaseId });
      console.log(`Database ${this.databaseId} already exists.`);
    } catch (error: unknown) {
      const appwriteError = error as { code: number };
      if (appwriteError.code === 404) {
        console.log(`Creating database ${this.databaseId}...`);
        await this.tables.create({
          databaseId: this.databaseId,
          name: 'Portfolio Database',
        });
      } else {
        throw error;
      }
    }
  }

  private async setupTables() {
    // We can now create tables with inline columns and indexes for 2026 performance
    await this.createHomeTable();
    await this.createExperienceTable();
    await this.createEducationTable();
    await this.createSkillsTable();
    await this.createSolutionsTable();
    await this.createSocialsTable();
    await this.createContactInfoTable();
  }

  private async createHomeTable() {
    await this.ensureTable({
      tableId: 'home',
      name: 'Home',
      columns: [
        { key: 'firstName', type: 'string', size: 255, required: true },
        { key: 'lastName', type: 'string', size: 255, required: true },
        { key: 'namePresentation', type: 'string', size: 255, required: true },
        { key: 'title', type: 'string', size: 255, required: true },
        { key: 'description', type: 'string', size: 2000, required: true },
        { key: 'pictureId', type: 'string', size: 255, required: false },
        { key: 'cvId', type: 'string', size: 255, required: false },
        {
          key: 'downloadButtonText',
          type: 'string',
          size: 255,
          required: true,
        },
        { key: 'locale', type: 'string', size: 10, required: true },
        { key: 'journeyStartedIn', type: 'integer', required: true },
      ],
      indexes: [
        { key: 'idx_locale', type: IndexType.Key, attributes: ['locale'] },
      ],
    });
  }

  private async createExperienceTable() {
    await this.ensureTable({
      tableId: 'experience',
      name: 'Experience',
      columns: [
        { key: 'company', type: 'string', size: 255, required: true },
        { key: 'position', type: 'string', size: 255, required: true },
        { key: 'duration', type: 'string', size: 100, required: true },
        { key: 'description', type: 'string', size: 2000, required: false },
        { key: 'sort', type: 'integer', required: true },
        { key: 'locale', type: 'string', size: 10, required: true },
      ],
      indexes: [
        { key: 'idx_sort', type: IndexType.Key, attributes: ['sort'] },
        { key: 'idx_locale', type: IndexType.Key, attributes: ['locale'] },
      ],
    });
  }

  private async createEducationTable() {
    await this.ensureTable({
      tableId: 'education',
      name: 'Education',
      columns: [
        { key: 'institution', type: 'string', size: 255, required: true },
        { key: 'degree', type: 'string', size: 255, required: true },
        { key: 'duration', type: 'string', size: 100, required: true },
        { key: 'description', type: 'string', size: 2000, required: false },
        { key: 'sort', type: 'integer', required: true },
        { key: 'locale', type: 'string', size: 10, required: true },
      ],
      indexes: [
        { key: 'idx_sort', type: IndexType.Key, attributes: ['sort'] },
        { key: 'idx_locale', type: IndexType.Key, attributes: ['locale'] },
      ],
    });
  }

  private async createSkillsTable() {
    await this.ensureTable({
      tableId: 'skills',
      name: 'Skills',
      columns: [
        { key: 'title', type: 'string', size: 255, required: true },
        { key: 'iconCode', type: 'string', size: 100, required: true },
        { key: 'type', type: 'string', size: 50, required: true },
        { key: 'sort', type: 'integer', required: true },
        { key: 'locale', type: 'string', size: 10, required: true },
      ],
      indexes: [
        { key: 'idx_sort', type: IndexType.Key, attributes: ['sort'] },
        { key: 'idx_locale', type: IndexType.Key, attributes: ['locale'] },
      ],
    });
  }

  private async createSolutionsTable() {
    await this.ensureTable({
      tableId: 'solutions',
      name: 'Solutions',
      columns: [
        { key: 'title', type: 'string', size: 255, required: true },
        { key: 'description', type: 'string', size: 2000, required: true },
        { key: 'iconCode', type: 'string', size: 100, required: true },
        { key: 'sort', type: 'integer', required: true },
        { key: 'locale', type: 'string', size: 10, required: true },
      ],
      indexes: [
        { key: 'idx_sort', type: IndexType.Key, attributes: ['sort'] },
        { key: 'idx_locale', type: IndexType.Key, attributes: ['locale'] },
      ],
    });
  }

  private async createSocialsTable() {
    await this.ensureTable({
      tableId: 'socials',
      name: 'Socials',
      columns: [
        { key: 'type', type: 'string', size: 100, required: true },
        { key: 'url', type: 'string', size: 500, required: true },
        { key: 'iconCode', type: 'string', size: 100, required: true },
        { key: 'sort', type: 'integer', required: true },
      ],
      indexes: [{ key: 'idx_sort', type: IndexType.Key, attributes: ['sort'] }],
    });
  }

  private async createContactInfoTable() {
    await this.ensureTable({
      tableId: 'contact_info',
      name: 'Contact Info',
      columns: [
        { key: 'type', type: 'string', size: 100, required: true },
        { key: 'value', type: 'string', size: 255, required: true },
        { key: 'iconCode', type: 'string', size: 100, required: true },
        { key: 'sort', type: 'integer', required: true },
        { key: 'locale', type: 'string', size: 10, required: true },
      ],
      indexes: [
        { key: 'idx_sort', type: IndexType.Key, attributes: ['sort'] },
        { key: 'idx_locale', type: IndexType.Key, attributes: ['locale'] },
      ],
    });
  }

  private async ensureTable(params: {
    tableId: string;
    name: string;
    columns: {
      key: string;
      type: string;
      size?: number;
      required: boolean;
      array?: boolean;
    }[];
    indexes: {
      key: string;
      type: IndexType;
      attributes: string[];
    }[];
  }) {
    try {
      await this.tables.getTable({
        databaseId: this.databaseId,
        tableId: params.tableId,
      });
      console.log(
        `Table ${params.name} already exists. Initializing missing columns...`,
      );
    } catch (error: unknown) {
      const appwriteError = error as { code: number };
      if (appwriteError.code === 404) {
        console.log(`Creating table ${params.name}...`);
        await this.tables.createTable({
          databaseId: this.databaseId,
          tableId: params.tableId,
          name: params.name,
          permissions: [
            Permission.read(Role.any()), // Public Read
            Permission.write(AppwriteProvider.getCuratorRole()), // Curator Write
          ],
        });
      } else {
        throw error;
      }
    }

    // Explicitly create columns to ensure Appwrite 1.8.1 compatibility
    for (const col of params.columns) {
      try {
        if (col.type === 'string') {
          await this.tables.createStringColumn({
            databaseId: this.databaseId,
            tableId: params.tableId,
            key: col.key,
            size: col.size || 255,
            required: col.required,
            array: col.array,
          });
        } else if (col.type === 'integer') {
          await this.tables.createIntegerColumn({
            databaseId: this.databaseId,
            tableId: params.tableId,
            key: col.key,
            required: col.required,
            array: col.array,
          });
        }
        console.log(`  [COLUMN] ${col.key} created.`);
      } catch (error: unknown) {
        if ((error as { code: number }).code !== 409) throw error;
      }
    }

    // Explicitly create indexes
    for (const idx of params.indexes) {
      try {
        await this.tables.createIndex({
          databaseId: this.databaseId,
          tableId: params.tableId,
          key: idx.key,
          type: idx.type,
          columns: idx.attributes,
        });
        console.log(`  [INDEX] ${idx.key} created.`);
      } catch (error: unknown) {
        if ((error as { code: number }).code !== 409) throw error;
      }
    }

    // Wait for attributes to be available (Appwrite 1.8.1 is async)
    await this.waitForColumns(params.tableId, params.columns.length);
  }

  private async waitForColumns(tableId: string, expectedCount: number) {
    let attempts = 0;
    const maxAttempts = 20;
    const delay = 100;

    while (attempts < maxAttempts) {
      const table = await this.tables.getTable({
        databaseId: this.databaseId,
        tableId,
      });

      if (table.columns && table.columns.length >= expectedCount) {
        // Basic check for count, ideally we'd check 'status === available'
        // but TypesDB 22.1.3 typing for columns is generic.
        return;
      }

      console.log(
        `  [WAIT] Waiting for columns in ${tableId}... (${attempts + 1}/${maxAttempts})`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempts++;
    }
  }

  private async ensureBuckets() {
    const buckets = [
      { id: 'assets', name: 'Portfolio Assets', public: true },
      { id: 'trash', name: 'Trash Bin', public: false },
    ];

    for (const bucket of buckets) {
      try {
        await this.storage.getBucket(bucket.id);
        console.log(`Bucket ${bucket.name} already exists.`);
      } catch (error: unknown) {
        const appwriteError = error as { code: number };
        if (appwriteError.code === 404) {
          console.log(`Creating bucket ${bucket.name}...`);
          await this.storage.createBucket({
            bucketId: bucket.id,
            name: bucket.name,
            permissions: [
              Permission.read(Role.any()), // Public Read
              Permission.write(AppwriteProvider.getCuratorRole()), // Curator Write
            ],
            fileSecurity: bucket.public,
          });
        } else {
          throw error;
        }
      }
    }
  }
}
