/**
 * ISectionService — Portfolio Manager Orchestrator.
 *
 * Implements simplified CRUD and reordering for the 7 standard portfolio sections:
 * Home, About, Experience, Education, Skills, Solutions, Contact.
 */

export interface MaturityReport {
  percentage: number;
  missingFields: string[];
}

export interface ISectionService {
  /** Retrieves the latest draft/live stats for a section. */
  getSection(sectionId: string): Promise<Record<string, unknown>>;

  /** Updates attributes for a section (simultaneous EN/PT support). */
  updateSection(
    sectionId: string,
    data: Record<string, unknown>,
  ): Promise<void>;

  /** Retrieves the current translation maturity for a specific language. */
  getMaturity(lang: 'en' | 'pt'): Promise<MaturityReport>;

  /** Bulk reorders items in a sortable collection (Experience, Education, Skills, etc.). */
  reorder(sectionId: string, itemIds: string[]): Promise<void>;

  /** Saves changes for a section before final synchronization. */
  saveSection(sectionId: string, data: Record<string, unknown>): Promise<void>;
}
/**
 * IMediaService — Portfolio Media Orchestrator.
 *
 * Maps UI file uploads to standard storage buckets.
 */

export interface IMediaService {
  /** Uploads a file and returns the unique Appwrite fileId. */
  upload(file: File, context: 'profile' | 'resume' | 'asset'): Promise<string>;

  /** Deletes an existing media asset from storage. */
  delete(fileId: string): Promise<void>;

  /** Retrieves a preview URL for a storage asset. */
  getPreviewUrl(fileId: string): Promise<string>;
}
