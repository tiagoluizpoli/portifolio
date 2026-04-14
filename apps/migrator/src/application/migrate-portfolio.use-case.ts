import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  AppwriteProvider,
  ID,
  type Models,
  type TablesDB,
} from '@repo/appwrite-core/server';
import { DataParser } from '../domain/data.parser.js';
import { SchemaManager } from '../infrastructure/schema.manager.js';
import { StorageManager } from '../infrastructure/storage.manager.js';

export class MigratePortfolioUseCase {
  private tables: TablesDB;
  private databaseId: string;
  private schemaManager: SchemaManager;
  private storageManager: StorageManager;

  constructor() {
    this.schemaManager = new SchemaManager();
    this.storageManager = new StorageManager();
    this.tables = AppwriteProvider.getTablesDB();
    this.databaseId = AppwriteProvider.getEnv().APPWRITE_DATABASE_ID;
  }

  async execute(
    options: { conflictStrategy?: 'overwrite' | 'keep-newer' | 'skip' } = {},
  ) {
    const strategy = options.conflictStrategy || 'skip';
    console.log(
      `--- Starting Transactional Migration (Strategy: ${strategy}) ---`,
    );

    // 1. Ensure Infrastructure (Schema & Storage)
    await this.schemaManager.run();
    await this.schemaManager.truncateAllTables();

    // 2. Parse Data
    const data = DataParser.parse();
    // 3. Handle Assets (Upload live files)
    console.log('[STEP] Uploading Portfolio Assets...');
    const usedFileIds = new Set<string>();
    const idMapping = new Map<string, string>(); // §VIII: Map old deterministic IDs to new Appwrite IDs
    let realProfileId = '';
    let realCvId = '';

    try {
      // Robust path resolution (check if we are in apps/migrator or root)
      const assetDir = process.cwd().endsWith('apps/migrator')
        ? path.join(process.cwd(), 'assets')
        : path.join(process.cwd(), 'apps/migrator/assets');

      const profileBuffer = fs.readFileSync(path.join(assetDir, 'profile.jpg'));
      const cvBuffer = fs.readFileSync(path.join(assetDir, 'cv.pdf'));

      const profileFile = await this.storageManager.uploadAsset(
        'assets',
        ID.unique(),
        'profile.jpg',
        profileBuffer,
      );
      realProfileId = profileFile.$id;
      usedFileIds.add(realProfileId);

      const cvFile = await this.storageManager.uploadAsset(
        'assets',
        ID.unique(),
        'cv.pdf',
        cvBuffer,
      );
      realCvId = cvFile.$id;
      usedFileIds.add(realCvId);
    } catch (assetError) {
      console.warn(
        '[WARN] Asset upload failed (using placeholders):',
        assetError,
      );
    }

    const batches = DataParser.getBatches(data);

    // 4. Execute Migration (Atomic 2026 Ingestion)
    console.log('[STEP] Initiating Atomic Data Migration...');

    let transaction: Models.Transaction | null = null;
    try {
      // 2.13: Atomic Ingestion
      transaction = await this.tables.createTransaction();
      const transactionId = transaction.$id;

      for (const batch of batches) {
        console.log(
          `[BATCH] Processing ${batch.tableId} (${batch.rows.length} rows)...`,
        );
        // Skip delay in test environment (§VIII)
        if (process.env.NODE_ENV !== 'test') {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // GUIDELINE 1.9: Eventual Consistency Delay
        }
        for (const row of batch.rows) {
          // Track and map asset IDs
          if (batch.tableId === 'home') {
            if (
              (row.pictureId === 'profile-pic' ||
                row.pictureId === '1eb8d18b-3d9a-4dcc-9168-82c93c4cd95d') &&
              realProfileId
            ) {
              row.pictureId = realProfileId;
            }
            if (
              (row.cvId === 'cv-pdf' ||
                row.cvId === '296aaaa8-3b32-4d20-96d8-e58d769334fb') &&
              realCvId
            ) {
              row.cvId = realCvId;
            }
          }

          // Transformation now handled in DataParser.parse()

          const pictureId = row.pictureId as string | undefined;
          const cvId = row.cvId as string | undefined;

          if (
            pictureId &&
            pictureId !== 'profile-pic' &&
            pictureId !== '1eb8d18b-3d9a-4dcc-9168-82c93c4cd95d'
          )
            usedFileIds.add(pictureId);
          if (
            cvId &&
            cvId !== 'cv-pdf' &&
            cvId !== '296aaaa8-3b32-4d20-96d8-e58d769334fb'
          )
            usedFileIds.add(cvId);

          // 2.15: Pivot to Native IDs (§VIII)
          const originalId = this.generateDeterministicId(
            batch.tableId,
            row as Record<string, unknown>,
          );

          // Handle relationships using mapping
          const processedRow = { ...row } as Record<string, unknown>;
          if (batch.tableId === 'impact_metrics') {
            if (processedRow.aboutId) {
              const newAboutId = idMapping.get(processedRow.aboutId as string);
              if (newAboutId) processedRow.aboutId = newAboutId;
            }
            if (processedRow.sourceId) {
              const newSourceId = idMapping.get(
                processedRow.sourceId as string,
              );
              if (newSourceId) processedRow.sourceId = newSourceId;
            }
          }

          // Perform transactional creation with native ID
          const rowId =
            batch.tableId === 'platforms'
              ? (processedRow.id as string)
              : ID.unique();
          if (batch.tableId === 'platforms') delete processedRow.id;

          const rowResponse = await this.tables.createRow({
            databaseId: this.databaseId,
            tableId: batch.tableId,
            rowId,
            data: processedRow,
            transactionId,
          });

          // Store mapping for children
          idMapping.set(originalId, rowResponse.$id);
        }
      }

      // Commit transaction
      await this.tables.updateTransaction({
        transactionId,
        commit: true,
      });

      // 4. Asset Lifecycle (Mark-and-Sweep)
      console.log('[STEP] Starting Asset Maintenance...');
      await this.storageManager.cleanupOrphans(usedFileIds);

      console.log('--- Migration: PASS (Atomic Sync) ---');
    } catch (error) {
      console.error(
        '[CRITICAL] Migration Failed during ingestion. Original error:',
        error,
      );

      if (transaction) {
        // 2.14: Automatic Rollback
        try {
          await this.tables.updateTransaction({
            transactionId: transaction.$id,
            rollback: true,
          });
        } catch (rollbackError) {
          console.error(
            '[WARN] Failed to rollback transaction:',
            rollbackError,
          );
        }
      }

      throw new Error(
        `Migration failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private generateDeterministicId(
    tableId: string,
    row: Record<string, unknown>,
  ): string {
    const locale = (row.locale as string) || 'en';
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 30);

    switch (tableId) {
      case 'home':
        return `home-${locale}`;
      case 'about':
        return `about-${locale}`;
      case 'metric_sources':
        return `ms-${slugify((row.name as string) || 'unknown')}`;
      case 'impact_metrics':
        return `im-${slugify((row.internalCode as string) || (row.label as string))}-${row.aboutId}`;
      case 'experience':
        return `exp-${slugify((row.company as string) || 'unknown')}-${locale}`;
      case 'education':
        return `edu-${slugify((row.institution as string) || 'unknown')}-${locale}`;
      case 'skills':
        return `skill-${slugify((row.title as string) || 'unknown')}`;
      case 'solutions':
        return `sol-${slugify((row.title as string) || 'unknown')}-${locale}`;
      case 'socials': {
        const pId = slugify((row.platformId as string) || 'unknown');
        const uName = slugify((row.username as string) || 'unknown');
        return `social-${pId}-${uName}`;
      }
      case 'platforms':
        return (
          (row.id as string) ||
          `plat-${slugify((row.title as string) || 'unknown')}`
        );
      case 'contact_info':
        return `contact-${slugify((row.type as string) || 'unknown')}-${locale}`;
      default:
        return ID.unique();
    }
  }
}
