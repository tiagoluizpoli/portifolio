import * as fs from 'node:fs';
import * as path from 'node:path';
import { AppwriteProvider } from '@repo/appwrite-core';
import { ID, type TablesDB } from 'node-appwrite';
import { DataParser } from '../domain/data.parser';
import { SchemaManager } from '../infrastructure/schema.manager';
import { StorageManager } from '../infrastructure/storage.manager';

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

    // 2. Parse Data
    const data = DataParser.parse();
    // 3. Handle Assets (Upload live files)
    console.log('[STEP] Uploading Portfolio Assets...');
    const usedFileIds = new Set<string>();
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

    // 4. Execute Migration within an Atomic Transaction
    console.log('[STEP] Initiating Atomic Transaction...');
    const transaction = await this.tables.createTransaction({ ttl: 60 });

    try {
      for (const batch of batches) {
        console.log(
          `[BATCH] Processing ${batch.tableId} (${batch.rows.length} rows)...`,
        );
        for (const row of batch.rows) {
          // Track and map asset IDs
          if (batch.tableId === 'home') {
            if (row.pictureId === 'profile-pic' && realProfileId) {
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

          const pictureId = row.pictureId as string | undefined;
          const cvId = row.cvId as string | undefined;

          if (pictureId && pictureId !== 'profile-pic')
            usedFileIds.add(pictureId);
          if (cvId && cvId !== 'cv-pdf') usedFileIds.add(cvId);

          // Generate deterministic ID for idempotency (prevents duplicates)
          const rowId = this.generateDeterministicId(
            batch.tableId,
            row as Record<string, unknown>,
          );

          // Handle Conflict Strategy
          if (strategy === 'skip') {
            try {
              // Check if row already exists
              // biome-ignore lint/suspicious/noExplicitAny: TablesDB getRow exists in runtime but might be missing in older TS types
              await (this.tables as any).getRow({
                databaseId: this.databaseId,
                tableId: batch.tableId,
                rowId: rowId,
              });
              console.log(
                `[SKIP] Row ${rowId} already exists in ${batch.tableId}.`,
              );
              continue;
            } catch (_error) {
              // Row doesn't exist (likely 404), proceed with creation
            }
          }

          await this.tables.upsertRow({
            databaseId: this.databaseId,
            tableId: batch.tableId,
            rowId: rowId,
            data: row as Record<string, unknown>,
            transactionId: transaction.$id,
          });
        }
      }

      console.log('[STEP] Committing Data Transaction...');
      await this.tables.updateTransaction({
        transactionId: transaction.$id,
        commit: true,
      });

      // 4. Asset Lifecycle (Mark-and-Sweep)
      console.log('[STEP] Starting Asset Maintenance...');
      await this.storageManager.cleanupOrphans(usedFileIds);

      console.log('--- Migration: PASS (100% Synced) ---');
    } catch (error) {
      console.error('[CRITICAL] Migration Failed. Rolling back...', error);

      try {
        await this.tables.updateTransaction({
          transactionId: transaction.$id,
          rollback: true,
        });
      } catch (rollbackError) {
        console.error('[FATAL] Rollback failed:', rollbackError);
      }

      throw new Error(
        `Migration failed and was rolled back: ${error instanceof Error ? error.message : String(error)}`,
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
      case 'experience':
        return `exp-${slugify((row.company as string) || 'unknown')}-${locale}`;
      case 'education':
        return `edu-${slugify((row.institution as string) || 'unknown')}-${locale}`;
      case 'skills':
        return `skill-${slugify((row.title as string) || 'unknown')}`;
      case 'solutions':
        return `sol-${slugify((row.title as string) || 'unknown')}-${locale}`;
      case 'socials':
        return `social-${slugify((row.type as string) || 'unknown')}`;
      case 'contact_info':
        return `contact-${slugify((row.type as string) || 'unknown')}-${locale}`;
      default:
        return ID.unique();
    }
  }
}
