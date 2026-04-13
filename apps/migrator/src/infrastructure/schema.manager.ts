import {
  AppwriteProvider,
  IndexType,
  Permission,
  Role,
  type Storage,
  type TablesDB,
} from '@repo/appwrite-core/server';

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
      console.log(
        '[DEBUG] Schema Initialization Complete. Waiting for consistency...',
      );
      await this.delay(2000); // GUIDELINE 1.9: Eventual Consistency Delay
    } catch (err) {
      console.error('[DEBUG] Schema Initialization FAILED:', err);
      throw err;
    }
  }

  /**
   * Truncates all tables managed by the SchemaManager.
   * Useful for clean-slate migrations (§VIII).
   */
  async truncateAllTables() {
    console.log('[WIPE] Truncating all CMS tables...');
    const tableIds = [
      'home',
      'about',
      'experience',
      'education',
      'skills',
      'solutions',
      'socials',
      'contact_info',
      'metric_sources',
      'impact_metrics',
    ];

    for (const tableId of tableIds) {
      try {
        const response = await this.tables.listRows({
          databaseId: this.databaseId,
          tableId,
        });

        for (const row of response.rows) {
          await this.tables.deleteRow({
            databaseId: this.databaseId,
            tableId,
            rowId: row.$id,
          });
        }
        console.log(`  [WIPE] Table ${tableId} cleared.`);
      } catch (err: unknown) {
        const error = err as { code?: number };
        if (error.code === 404) continue; // Skip if table doesn't exist yet
        console.warn(`  [WARN] Failed to truncate ${tableId}:`, err);
      }
    }
  }

  private async ensureDatabase() {
    try {
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
    await this.createHomeTable();
    await this.createAboutTable();
    await this.createMetricSourcesTable();
    await this.createImpactMetricsTable();
    await this.createExperienceTable();
    await this.createEducationTable();
    await this.createSkillsTable();
    await this.createSolutionsTable();
    await this.createPlatformsTable();
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

  private async createAboutTable() {
    await this.ensureTable({
      tableId: 'about',
      name: 'About',
      columns: [
        { key: 'content', type: 'string', size: 5000, required: true },
        { key: 'locale', type: 'string', size: 10, required: true },
      ],
      indexes: [
        { key: 'idx_locale', type: IndexType.Key, attributes: ['locale'] },
      ],
    });
  }

  private async createMetricSourcesTable() {
    await this.ensureTable({
      tableId: 'metric_sources',
      name: 'Metric Sources',
      columns: [
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'type', type: 'string', size: 50, required: true },
        { key: 'iconCode', type: 'string', size: 100, required: true },
        { key: 'functionId', type: 'string', size: 255, required: false },
        { key: 'status', type: 'string', size: 50, required: true },
      ],
      indexes: [],
    });
  }

  private async createImpactMetricsTable() {
    await this.ensureTable({
      tableId: 'impact_metrics',
      name: 'Impact Metrics',
      columns: [
        { key: 'internalCode', type: 'string', size: 255, required: true },
        { key: 'locale', type: 'string', size: 10, required: true },
        { key: 'label', type: 'string', size: 255, required: true },
        { key: 'value', type: 'string', size: 100, required: false },
        { key: 'sourceId', type: 'string', size: 50, required: true },
        { key: 'iconCode', type: 'string', size: 100, required: false },
        { key: 'isPlaceholder', type: 'boolean', required: true },
        { key: 'aboutId', type: 'string', size: 50, required: true },
      ],
      indexes: [
        { key: 'idx_about', type: IndexType.Key, attributes: ['aboutId'] },
        {
          key: 'idx_parity',
          type: IndexType.Unique,
          attributes: ['locale', 'internalCode'],
        },
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
        { key: 'location', type: 'string', size: 255, required: true },
        { key: 'current', type: 'boolean', required: true },
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
        { key: 'location', type: 'string', size: 255, required: true },
        { key: 'current', type: 'boolean', required: true },
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
        { key: 'status', type: 'string', size: 50, required: true },
      ],
      indexes: [{ key: 'idx_sort', type: IndexType.Key, attributes: ['sort'] }],
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

  private async createPlatformsTable() {
    await this.ensureTable({
      tableId: 'platforms',
      name: 'Platforms',
      columns: [
        { key: 'title', type: 'string', size: 255, required: true },
        { key: 'urlTemplate', type: 'string', size: 500, required: true },
        { key: 'iconCode', type: 'string', size: 100, required: true },
        { key: 'sort', type: 'integer', required: true },
        { key: 'status', type: 'string', size: 50, required: true },
      ],
      indexes: [{ key: 'idx_sort', type: IndexType.Key, attributes: ['sort'] }],
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
        { key: 'status', type: 'string', size: 50, required: true },
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

    // Explicitly create columns
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
        } else if (col.type === 'boolean') {
          await this.tables.createBooleanColumn({
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

    // Wait for columns to be available (Guideline 1.9)
    await this.waitForColumns(params.tableId, params.columns.length);

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
  }

  private async waitForColumns(tableId: string, expectedCount: number) {
    let attempts = 0;
    const maxAttempts = 20;
    const delay = 500;

    while (attempts < maxAttempts) {
      const table = await this.tables.getTable({
        databaseId: this.databaseId,
        tableId,
      });

      if (table.columns && table.columns.length >= expectedCount) {
        return;
      }

      console.log(
        `  [WAIT] Waiting for columns in ${tableId}... (${attempts + 1}/${maxAttempts})`,
      );
      await this.delay(delay);
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

  private async delay(ms: number) {
    if (process.env.NODE_ENV === 'test') return;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
