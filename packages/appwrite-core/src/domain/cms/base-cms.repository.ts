import { Query, type Models } from 'node-appwrite';

/**
 * BaseCmsRepository: Generic Persistence Orchestrator 🎯 MVP
 * Implements standard CRUD and reordering logic for Portfolio Chapters.
 * Adheres to Principle VIII (SRP) and Infrastructure Invisibility.
 */

export abstract class BaseCmsRepository<T extends { id: string; sort?: number }> {
  constructor(
    protected readonly databases: any, // Appwrite Databases
    protected readonly databaseId: string,
    protected readonly collectionId: string
  ) {}

  async get(id: string): Promise<T | null> {
    try {
      const doc = await this.databases.getDocument(this.databaseId, this.collectionId, id);
      return this.mapToEntity(doc);
    } catch {
      return null;
    }
  }

  async list(queries: string[] = []): Promise<T[]> {
    const response = await this.databases.listDocuments(
      this.databaseId,
      this.collectionId,
      queries
    );
    return response.documents.map((doc: Models.Document) => this.mapToEntity(doc));
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const doc = await this.databases.updateDocument(
      this.databaseId,
      this.collectionId,
      id,
      this.mapToDb(data)
    );
    return this.mapToEntity(doc);
  }

  async reorder(activeId: string, overId: string): Promise<void> {
    const items = await this.list([Query.orderAsc('sort')]);
    const oldIndex = items.findIndex((i) => i.id === activeId);
    const newIndex = items.findIndex((i) => i.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    // Use local arrayMove-like logic for calculation
    const newItems = [...items];
    const [removed] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, removed);

    // Batch update sort values (Principle II Efficiency)
    await Promise.all(
      newItems.map((item, index) => 
        this.databases.updateDocument(this.databaseId, this.collectionId, item.id, { sort: index })
      )
    );
  }

  protected abstract mapToEntity(doc: Models.Document): T;
  protected abstract mapToDb(data: Partial<T>): any;
}
