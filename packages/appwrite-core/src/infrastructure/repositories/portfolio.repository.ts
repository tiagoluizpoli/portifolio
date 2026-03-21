import type { Models } from 'node-appwrite';
import type { Portfolio } from '../../domain/repositories/interfaces.js';
import { AppwriteProvider } from '../appwrite.client.js';
import { AppWriteRepository } from './appwrite.repository.js';

export class PortfolioRepository extends AppWriteRepository<Portfolio> {
  constructor(databaseId: string, tableId: string) {
    super(AppwriteProvider.client, databaseId, tableId);
  }

  protected mapToModel(doc: Models.Document): Portfolio {
    const data = doc as unknown as Record<string, unknown>;
    return {
      id: doc.$id,
      title: (data.title as string) || '',
      description: (data.description as string) || '',
    };
  }

  async getPortfolioRecord(rowId: string): Promise<Portfolio | null> {
    return this.findById(rowId);
  }
}
